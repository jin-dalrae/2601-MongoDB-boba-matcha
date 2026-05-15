// Mock agents service — drop-in replacement for the Python FastAPI agents
// when you don't have an LLM key. Returns plausible negotiation, audit, and
// settlement responses, and writes the same MongoDB records the real agents
// would (NegotiationLog, AuditReport, X402Settlement) so the rest of the app
// reflects the activity.
//
// Usage:  AGENT_PORT=8001 node agents/mock-server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const {
    AutoBid, Contract, ContentSubmission,
    AuditReport, X402Settlement, NegotiationLog,
} = require('../server/models');

const PORT = process.env.AGENT_PORT || 8001;
const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
    console.error('MONGODB_URI is not set in .env');
    process.exit(1);
}

mongoose.connect(MONGO_URI, { dbName: 'matcha' })
    .then(() => console.log('Mock agents: MongoDB Connected (db: matcha)'))
    .catch((err) => {
        console.error('Mock agents: MongoDB connection error:', err.message);
        process.exit(1);
    });

const app = express();
app.use(cors());
app.use(express.json());

const fakeHash = (prefix = '0x') =>
    prefix + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

const fakeReceipt = () =>
    'Receipt-' + Array.from({ length: 16 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]).join('');

const round2 = (n) => Math.round(n * 100) / 100;

// -------------------------------------------------------------
// POST /negotiate
// -------------------------------------------------------------
app.post('/negotiate', async (req, res) => {
    try {
        const {
            contract_id,
            creator_id,
            advertiser_id,
            campaign_id,
            initial_offer = {},
            max_rounds = 5,
        } = req.body;

        const initialPrice = Number(initial_offer.price) || 500;
        const deliverable = initial_offer.deliverable || '1 video';

        // Mock 3-round negotiation that converges around 92% of asking.
        const round1 = Math.round(initialPrice * 0.75);
        const round2Price = Math.round(initialPrice * 0.85);
        const finalPrice = Math.round(initialPrice * 0.92);

        const messages = [
            `Brand agent: We can start at $${round1} for ${deliverable}.`,
            `Creator agent: Counter at $${initialPrice} — engagement data supports it.`,
            `Brand agent: Compromise at $${round2Price}, with a tier-1 bonus.`,
            `Creator agent: Accept at $${finalPrice} with audit-tied bonus structure.`,
            `Brand agent: Agreed. Drafting contract.`,
        ];

        const final_terms = {
            price: finalPrice,
            payout: finalPrice,
            deliverable,
            conditional_tiers: {
                tier_1: { views: 1000, bonus: Math.round(finalPrice * 0.1) },
                tier_2: { views: 10000, bonus: Math.round(finalPrice * 0.3) },
            },
            audit_criteria: 'Feature product clearly in first 15 seconds; tag the brand.',
        };

        // Persist a NegotiationLog tied to the AutoBid (contract_id is the AutoBid id
        // until a Contract is created — the frontend will create the Contract after).
        if (mongoose.isValidObjectId(contract_id)) {
            try {
                await NegotiationLog.findOneAndUpdate(
                    { autoBidId: contract_id },
                    {
                        autoBidId: contract_id,
                        round_history: [
                            { round: 1, price: round1, concessions: 'Initial ask', reasoning: 'Anchoring low', timestamp: new Date() },
                            { round: 2, price: initialPrice, concessions: 'None', reasoning: 'Creator counters at asking', timestamp: new Date() },
                            { round: 3, price: finalPrice, concessions: 'Tier-1 bonus added', reasoning: 'Met in the middle with audit-tied bonus', timestamp: new Date() },
                        ],
                        agent_logic_summary: `Converged at $${finalPrice} after ${3} rounds (mock).`,
                    },
                    { upsert: true, new: true, setDefaultsOnInsert: true },
                );
            } catch (e) {
                console.warn('Could not persist NegotiationLog:', e.message);
            }
        }

        res.json({
            contract_id,
            status: 'accepted',
            round_number: 3,
            final_terms,
            reasoning: `Mock negotiation converged at $${finalPrice} (92% of asking). Creator profile suggests strong engagement; brand budget allows.`,
            messages,
            max_rounds,
            creator_id,
            advertiser_id,
            campaign_id,
        });
    } catch (error) {
        console.error('/negotiate error:', error);
        res.status(500).json({ detail: error.message });
    }
});

// -------------------------------------------------------------
// POST /audit  (audit only, no payment)
// -------------------------------------------------------------
const buildAudit = ({ contract_terms = {}, content_submission = {} }) => {
    // Deterministic-ish mock: vary score slightly per submission url so two
    // runs against the same contract don't look identical.
    const seed = (content_submission.content_url || '').length || Math.random() * 100;
    const content_score = round2(Math.min(0.99, 0.78 + ((seed % 17) / 100)));
    const tier_achieved = content_score >= 0.9 ? 2 : content_score >= 0.82 ? 1 : 0;

    const base = Number(contract_terms.base_payout) || 500;
    const tierBonus = tier_achieved === 2
        ? (contract_terms.conditional_tiers?.tier_2?.bonus ?? Math.round(base * 0.3))
        : tier_achieved === 1
            ? (contract_terms.conditional_tiers?.tier_1?.bonus ?? Math.round(base * 0.1))
            : 0;

    return {
        audit_result: {
            content_score,
            tier_achieved,
            reasoning: `Mock audit: content meets criteria (${Math.round(content_score * 100)}%). Tier ${tier_achieved} reached.`,
        },
        payment_breakdown: {
            base,
            bonus: tierBonus,
            total: base + tierBonus,
            tier_achieved,
        },
        recommended_payment: base + tierBonus,
    };
};

app.post('/audit', async (req, res) => {
    try {
        const result = buildAudit(req.body);
        res.json(result);
    } catch (error) {
        console.error('/audit error:', error);
        res.status(500).json({ detail: error.message });
    }
});

// -------------------------------------------------------------
// POST /settle  (audit + write AuditReport + X402Settlement)
// -------------------------------------------------------------
app.post('/settle', async (req, res) => {
    try {
        const { contract_id, contract_terms = {}, content_submission = {} } = req.body;
        const audit = buildAudit({ contract_terms, content_submission });

        let settlementDoc = null;
        let auditDoc = null;

        if (mongoose.isValidObjectId(contract_id)) {
            const contract = await Contract.findById(contract_id);
            if (contract) {
                let submission = null;
                if (mongoose.isValidObjectId(content_submission.submission_id)) {
                    submission = await ContentSubmission.findById(content_submission.submission_id);
                }
                if (!submission) {
                    submission = await ContentSubmission.findOne({ contractId: contract._id }).sort({ submitted_at: -1 });
                }

                if (submission) {
                    auditDoc = await AuditReport.findOneAndUpdate(
                        { submissionId: submission._id },
                        {
                            submissionId: submission._id,
                            contractId: contract._id,
                            video_fingerprint: fakeHash('').slice(0, 32),
                            content_score: audit.audit_result.content_score,
                            tier_achieved: audit.audit_result.tier_achieved,
                            reasoning_log: audit.audit_result.reasoning,
                            generatedAt: new Date(),
                        },
                        { upsert: true, new: true, setDefaultsOnInsert: true },
                    );
                }

                settlementDoc = await X402Settlement.findOneAndUpdate(
                    { contractId: contract._id },
                    {
                        contractId: contract._id,
                        auditReportId: auditDoc?._id,
                        x402_handshake_header: 'X402-1.0-Payment-Required',
                        status: 'Settled',
                        stablecoin_hash: fakeHash(),
                        total_paid: audit.payment_breakdown.total,
                        receipt_hash: fakeReceipt(),
                    },
                    { upsert: true, new: true, setDefaultsOnInsert: true },
                );

                contract.status = 'Settled';
                await contract.save();
            }
        }

        res.json({
            contract_id,
            settlement_id: settlementDoc?._id || null,
            status: 'Settled',
            audit_result: audit.audit_result,
            payment_breakdown: audit.payment_breakdown,
            transaction_hash: settlementDoc?.stablecoin_hash || fakeHash(),
            error: null,
        });
    } catch (error) {
        console.error('/settle error:', error);
        res.status(500).json({ detail: error.message });
    }
});

// -------------------------------------------------------------
// GETs the frontend may call
// -------------------------------------------------------------
app.get('/negotiations/:contractId', async (req, res) => {
    try {
        const log = await NegotiationLog.findOne({ autoBidId: req.params.contractId });
        if (!log) return res.status(404).json({ detail: 'Negotiation not found' });
        res.json(log);
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

app.get('/settlement/:contractId', async (req, res) => {
    try {
        const settlement = await X402Settlement.findOne({ contractId: req.params.contractId });
        if (!settlement) return res.status(404).json({ detail: 'Settlement not found' });
        res.json(settlement);
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

app.get('/health', (_req, res) => {
    res.json({ status: 'ok', mode: 'mock', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Mock agents running on http://localhost:${PORT}`);
});
