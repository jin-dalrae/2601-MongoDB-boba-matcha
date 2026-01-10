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

        // Campaigns
        const campaigns = await Campaign.find({ advertiserId: advertiser._id });
        const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget_limit || 0), 0);

        // Calculate Spent (Sum of all settlements for this advertiser's contracts)
        const contracts = await Contract.find({ advertiserId: advertiser._id });
        const settlements = await X402Settlement.find({
            contractId: { $in: contracts.map(c => c._id) },
            status: 'Settled'
        });
        const totalSpent = settlements.reduce((sum, s) => sum + (s.total_paid || 0), 0);

        // Agent Activity
        const logs = await AgentLog.find().sort({ timestamp: -1 }).limit(5);

        // Recent Campaigns
        const recentCampaigns = [];
        for (const c of campaigns.slice(0, 3)) {
            // Find creators (AutoBids)
            const bids = await AutoBid.find({ campaignId: c._id });
            recentCampaigns.push({
                id: c._id,
                name: c.title,
                status: c.status,
                creators: bids.length,
                spent: 0 // In a real app we'd sum per campaign
            });
        }

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
                time: l.timestamp
            }))
        });

    } catch (err) {
        console.error("Dashboard Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// 2. Campaigns List
app.get('/api/campaigns', async (req, res) => {
    try {
        const advertiser = await getDemoAdvertiser();
        const campaigns = await Campaign.find({ advertiserId: advertiser._id });

        const result = await Promise.all(campaigns.map(async c => {
            const bids = await AutoBid.find({ campaignId: c._id });
            return {
                id: c._id,
                name: c.title,
                status: c.status,
                creators: bids.length,
                spent: 0, // Placeholder
                budget: c.budget_limit
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
            id: bid.creatorId?._id,
            name: bid.creatorId?.name || 'Unknown',
            platform: 'TikTok',
            fitScore: 85, // Mock
            bid: bid.current_bid,
            status: bid.status
        }));

        // Contracts (Linked via AutoBid)
        const autoBidIds = autoBids.map(b => b._id);
        const contracts = await Contract.find({ autoBidId: { $in: autoBidIds } })
            .populate('creatorId', 'name');

        const contractList = contracts.map(c => ({
            id: c._id,
            title: 'Influencer Agreement',
            type: 'Master Service Agreement',
            status: c.status,
            version: '1.0',
            lastUpdated: 'Recently',
            parties: ['Matcha', c.creatorId?.name || 'Creator'],
            clauses: [
                { title: 'Scope of Work', text: c.audit_criteria },
                { title: 'Payment', text: `Total base payout of $${c.base_payout} upon completion.` }
            ]
        }));

        res.json({
            campaign: {
                id: campaign._id,
                name: campaign.title,
                status: campaign.status,
                creators: matches.length,
                spent: 0
            },
            matches,
            contracts: contractList
        });

    } catch (err) {
        console.error("Detail Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// 4. Payments (Pending & History)
app.get('/api/payments', async (req, res) => {
    try {
        // Pending: Contracts in 'active' or 'auditing' that have audit reports but NO settlement
        const pendingContracts = await Contract.find({ status: { $in: ['Audit Complete', 'Active', 'Auditing'] } })
            .populate({
                path: 'autoBidId',
                populate: { path: 'campaignId', select: 'title' }
            })
            .populate('creatorId', 'name')
            .lean();

        const pending = [];
        for (const contract of pendingContracts) {
            const audit = await AuditReport.findOne({ contractId: contract._id });
            const settlement = await X402Settlement.findOne({ contractId: contract._id });

            // If audit exists and no settlement, it's pending
            if (audit && !settlement) {
                pending.push({
                    id: contract._id,
                    campaignId: contract.autoBidId?.campaignId?._id,
                    campaignName: contract.autoBidId?.campaignId?.title || 'Untitled Campaign',
                    creatorName: contract.creatorId?.name || 'Unknown',
                    amount: contract.base_payout,
                    status: 'Pending',
                    auditScore: audit.content_score,
                    auditId: audit._id
                });
            }
        }

        // History: Settlements
        const settlements = await X402Settlement.find()
            .populate({
                path: 'contractId',
                populate: [
                    {
                        path: 'autoBidId',
                        populate: { path: 'campaignId', select: 'title' }
                    },
                    { path: 'creatorId', select: 'name' }
                ]
            });

        const history = settlements.map(s => ({
            id: s._id,
            campaignName: s.contractId?.autoBidId?.campaignId?.title || 'Unknown',
            creatorName: s.contractId?.creatorId?.name || 'Unknown',
            amount: s.total_paid,
            status: 'Paid',
            date: s.createdAt
        }));

        res.json({ pending, history });

    } catch (err) {
        console.error("Payments Error:", err);
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
