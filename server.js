const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const {
    Contract, AuditReport, X402Settlement, User, Wallet,
    Campaign, AgentLog, AutoBid
} = require('./models');

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGODB_URI;

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

// --- Mock x402 Protocol Service ---
const x402Service = {
    createPaymentRequest: (amount, currency = 'USDC') => {
        // Simulates generating an x402 header
        return {
            header: `X402-1.0-Payment-Required`,
            details: {
                amount,
                currency,
                recipient: '0xLikelySomeWalletAddress...',
                memo: 'Creator Content Payout'
            }
        };
    },

    executePayment: async (payerId, payeeId, amount, details) => {
        // Simulates the actual blockchain transaction or off-chain settlement
        console.log(`[x402] Processing payment of ${amount} from ${payerId} to ${payeeId}`);

        // Simulate latency
        await new Promise(resolve => setTimeout(resolve, 1500));

        return {
            success: true,
            txHash: '0x' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            receipt: `x402-receipt-${Date.now()}`
        };
    }
};

// --- API Endpoints ---

// --- API Endpoints ---

// Helper: Get Primary Advertiser (for demo purposes)
const getDemoAdvertiser = async () => {
    return await User.findOne({ role: 'Advertiser' });
};

// 1. Dashboard Data
app.get('/api/dashboard', async (req, res) => {
    try {
        const advertiser = await getDemoAdvertiser();
        if (!advertiser) return res.status(404).json({ error: 'No advertiser found' });

        // Budget Stats (Mock calculation based on campaigns)
        const campaigns = await Campaign.find({ advertiserId: advertiser._id });
        const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget_allocated || 0), 0);
        const totalSpent = campaigns.reduce((sum, c) => sum + (c.budget_spent || 0), 0);

        // Agent Activity
        const logs = await AgentLog.find().sort({ timestamp: -1 }).limit(5);

        // Recent Campaigns
        const recentCampaigns = campaigns.slice(0, 3).map(c => ({
            id: c._id,
            name: c.title,
            status: c.status,
            creators: 0, // In real app, count distinct AutoBids
            spent: c.budget_spent
        }));

        res.json({
            advertiser: {
                budget: totalBudget,
                spent: totalSpent,
                remaining: totalBudget - totalSpent
            },
            campaigns: recentCampaigns,
            agentActivity: logs.map(l => ({
                id: l._id,
                text: l.action,
                time: l.timestamp // client can format this
            }))
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Campaigns List
app.get('/api/campaigns', async (req, res) => {
    try {
        const advertiser = await getDemoAdvertiser();
        const campaigns = await Campaign.find({ advertiserId: advertiser._id });

        const result = await Promise.all(campaigns.map(async c => {
            // Count creators involved (AutoBids accepted or Contracts)
            const creatorCount = await AutoBid.countDocuments({ campaignId: c._id });
            return {
                id: c._id,
                name: c.title,
                status: c.status,
                creators: creatorCount,
                spent: c.budget_spent,
                budget: c.budget_allocated
            };
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Campaign Detail (Matches & Contracts)
app.get('/api/campaigns/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const campaign = await Campaign.findById(id);
        if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

        // Matches (AutoBids)
        const autoBids = await AutoBid.find({ campaignId: id }).populate('creatorId', 'name email');
        const matches = autoBids.map(bid => ({
            id: bid.creatorId._id,
            name: bid.creatorId.name,
            platform: 'TikTok', // Mock for now
            fitScore: bid.match_score ? Math.round(bid.match_score * 100) : 0,
            bid: bid.current_ask,
            status: bid.status
        }));

        // Contracts
        const contracts = await Contract.find({ campaignId: id }).populate('creatorId', 'name');
        const contractList = contracts.map(c => ({
            id: c._id,
            title: 'Influencer Agreement', // Dynamic titles in real app
            status: c.status,
            version: '1.0',
            lastUpdated: 'Recently',
            parties: ['Matcha', c.creatorId?.name || 'Creator'],
            clauses: [
                { title: 'Payment', text: `Total payout of $${c.total_paid || c.base_payout} upon completion.` }
            ]
        }));

        res.json({
            campaign: {
                id: campaign._id,
                name: campaign.title,
                status: campaign.status,
                creators: matches.length,
                spent: campaign.budget_spent
            },
            matches,
            contracts: contractList
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Payments (Pending & History)
app.get('/api/payments', async (req, res) => {
    try {
        // Pending: Contracts in 'active' or 'auditing' that have audit reports but NO settlement
        // (Reusing logic from /pending but formatting for UI)
        const pendingContracts = await Contract.find({ status: { $in: ['Audit Complete', 'Active'] } })
            .populate('campaignId', 'title')
            .populate('creatorId', 'name')
            .lean();

        const pending = [];
        for (const contract of pendingContracts) {
            const audit = await AuditReport.findOne({ contractId: contract._id });
            const settlement = await X402Settlement.findOne({ contractId: contract._id });

            // If we have an audit but NO settlement, it's pending payment
            // Or if status is specifically 'Audit Complete'
            if (contract.status === 'Audit Complete' && !settlement) {
                pending.push({
                    id: contract._id,
                    campaignId: contract.campaignId._id,
                    campaignName: contract.campaignId.title,
                    creatorName: contract.creatorId.name,
                    amount: contract.base_payout,
                    status: 'Pending',
                    auditScore: audit ? audit.content_score : 'N/A',
                    auditId: audit ? audit._id : null
                });
            }
        }

        // History: Settlements
        const settlements = await X402Settlement.find()
            .populate({
                path: 'contractId',
                populate: [
                    { path: 'campaignId', select: 'title' },
                    { path: 'creatorId', select: 'name' }
                ]
            });

        const history = settlements.map(s => ({
            id: s._id,
            campaignName: s.contractId?.campaignId?.title || 'Unknown',
            creatorName: s.contractId?.creatorId?.name || 'Unknown',
            amount: s.total_paid,
            status: 'Paid',
            date: s.timestamp
        }));

        res.json({ pending, history });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Execute Payment
app.post('/api/payments/execute', async (req, res) => {
    const { contractId, auditId } = req.body;

    try {
        const contract = await Contract.findById(contractId);
        if (!contract) return res.status(404).json({ error: 'Contract not found' });

        const audit = await AuditReport.findById(auditId);
        if (!audit) return res.status(404).json({ error: 'Audit not found' });

        // 1. AI Agent Validation Logic
        console.log(`[Agent] Validating payment for Contract ${contractId}...`);
        // Rule: performance_score must be > 0.5 (just a mock rule)
        if (audit.content_score < 0.5) {
            return res.status(400).json({ error: 'Content score too low for auto-payment' });
        }

        // 2. Calculate Final Payout
        let totalPayout = contract.base_payout || 0;
        // Keep logic simple: if tier > 0, add bonus
        if (audit.tier_achieved > 0) {
            // Mock lookup from contract conditional_tiers
            // In a real app we'd parse the Mixed type safely
            const bonus = 50 * audit.tier_achieved;
            totalPayout += bonus;
        }

        // 3. Initiate x402 Handshake
        const paymentRequest = x402Service.createPaymentRequest(totalPayout);
        console.log(`[x402] Handshake:`, paymentRequest.header);

        // 4. Executing Payment
        const paymentResult = await x402Service.executePayment(
            contract.advertiserId,
            contract.creatorId,
            totalPayout,
            paymentRequest
        );

        // 5. Record Settlement
        const newSettlement = await X402Settlement.create({
            contractId: contract._id,
            auditReportId: audit._id,
            x402_handshake_header: paymentRequest.header,
            status: 'Settled',
            stablecoin_hash: paymentResult.txHash,
            total_paid: totalPayout,
            receipt_hash: paymentResult.receipt
        });

        // Update Contract Status
        contract.status = 'Settled';
        await contract.save();

        res.json({
            success: true,
            settlement: newSettlement,
            message: 'Payment executed via x402'
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
