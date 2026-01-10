const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../.env' }); // Load from root .env

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// --- In-Memory Data Store ---
let campaigns = [];
let bids = [];
let contracts = [];
let users = [
    { _id: 'user_1', name: 'Demo Advertiser', role: 'Advertiser', email: 'demo@ad.com' },
    { _id: 'creator_1', name: 'Alice Style', role: 'Creator', email: 'alice@style.com' },
    { _id: 'creator_2', name: 'Bob Tech', role: 'Creator', email: 'bob@tech.com' },
    { _id: 'creator_3', name: 'Charlie Vlog', role: 'Creator', email: 'charlie@vlog.com' }
];

// Seed Initial Data
const seedData = () => {
    console.log('Seeding In-Memory Data...');

    // Campaign 1: Beauty Launch
    const camp1 = {
        _id: 'camp_1',
        advertiserId: 'user_1',
        title: 'Summer Glow Serum Launch',
        product_info: {
            name: 'Glow Serum',
            description: 'Organic vitamin C serum for summer skin.',
            requires_shipping: true,
            keep_product: true
        },
        budget_limit: 5000,
        status: 'Matching',
        createdAt: new Date()
    };
    campaigns.push(camp1);

    // Bids for Camp 1
    bids.push({
        _id: 'bid_1',
        campaignId: 'camp_1',
        creatorId: users[1], // Alice
        current_bid: 1200,
        status: 'Proposed',
        negotiationLog: {
            round_history: [
                { round: 1, price: 1500, concessions: 'None', reasoning: 'High engagement rate', timestamp: new Date(Date.now() - 100000) },
                { round: 2, price: 1200, concessions: 'Will do 2 stories', reasoning: 'Long term partnership', timestamp: new Date() }
            ]
        },
        profileStats: { followers: 120000, engagement: '4.5%', category: 'Beauty', viralityScore: 8 }
    });

    bids.push({
        _id: 'bid_2',
        campaignId: 'camp_1',
        creatorId: users[2], // Bob (mismatch maybe?)
        current_bid: 900,
        status: 'Proposed',
        negotiationLog: {
            round_history: [
                { round: 1, price: 900, concessions: 'None', reasoning: 'Standard rate', timestamp: new Date() }
            ]
        },
        profileStats: { followers: 45000, engagement: '2.1%', category: 'Tech', viralityScore: 3 }
    });

    console.log(`Seeded: ${campaigns.length} campaigns, ${bids.length} bids.`);
};

// Run seed
seedData();

// --- API Routes ---

// 1. GET /api/campaigns (List Campaigns)
app.get('/api/campaigns', (req, res) => {
    res.json(campaigns);
});

// 2. POST /api/campaigns (Create Campaign)
app.post('/api/campaigns', (req, res) => {
    try {
        const {
            name, description, budget, duration,
            productName, shipProduct, keepProduct
        } = req.body;

        const newCampaign = {
            _id: 'camp_' + Date.now(),
            advertiserId: 'user_1', // Hardcoded for demo
            title: name,
            product_info: {
                name: productName,
                description: description,
                requires_shipping: shipProduct,
                keep_product: keepProduct
            },
            budget_limit: Number(budget),
            status: 'Matching',
            createdAt: new Date()
        };

        campaigns.unshift(newCampaign); // Add to top

        // Simulate influencers bidding (Auto-Bid Trigger)
        setTimeout(() => {
            console.log(`Auto-generating bids for campaign ${newCampaign._id}`);
            bids.push({
                _id: 'bid_auto_1_' + Date.now(),
                campaignId: newCampaign._id,
                creatorId: users[1], // Alice
                current_bid: Number(budget) * 0.8,
                status: 'Proposed',
                negotiationLog: {
                    round_history: [
                        { round: 1, price: Number(budget), concessions: 'None', reasoning: 'Initial ask', timestamp: new Date() }
                    ]
                },
                profileStats: { followers: 156000, engagement: '5.2%', category: 'Lifestyle', viralityScore: 9 }
            });

            bids.push({
                _id: 'bid_auto_2_' + Date.now(),
                campaignId: newCampaign._id,
                creatorId: users[2], // Bob
                current_bid: Number(budget) * 0.6,
                status: 'Proposed',
                negotiationLog: {
                    round_history: [
                        { round: 1, price: Number(budget) * 0.7, concessions: 'None', reasoning: 'Competitive offer', timestamp: new Date() }
                    ]
                },
                profileStats: { followers: 22000, engagement: '3.8%', category: 'Review', viralityScore: 4 }
            });
        }, 5000); // 5 seconds delay to simulate "Influencers making bids"

        res.status(201).json(newCampaign);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. GET /api/campaigns/:id/bids (Get Bids & Negotiation History)
app.get('/api/campaigns/:id/bids', (req, res) => {
    const { id } = req.params;
    const campaignBids = bids.filter(b => b.campaignId === id);
    res.json(campaignBids);
});

// 4. POST /api/agent/select (Agent Action Placeholder)
app.post('/api/agent/select', async (req, res) => {
    try {
        const { campaignId, bidId } = req.body;

        // Simulate thinking
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Update Bid
        const bidIndex = bids.findIndex(b => b._id === bidId);
        if (bidIndex > -1) {
            bids[bidIndex].status = 'Accepted';
        }

        // Create Contract
        const contract = {
            _id: 'contract_' + Date.now(),
            autoBidId: bidId,
            status: 'Signed'
        };
        contracts.push(contract);

        const reasoning = `
            Selected this creator because:
            1. High audience overlap with product category.
            2. Consistent engagement rate.
            3. Bid is within budget.
        `;

        res.json({
            success: true,
            contractId: contract._id,
            reasoning: reasoning.trim()
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. POST /api/payment/send (Payment Placeholder)
app.post('/api/payment/send', async (req, res) => {
    try {
        const { contractId, amount } = req.body;

        // Simulate Blockchain
        await new Promise(resolve => setTimeout(resolve, 1500));

        res.json({
            success: true,
            transactionHash: '0x' + Math.random().toString(16).substr(2, 40),
            status: 'Confirmed'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Backend Server (In-Memory) running on port ${PORT}`);
});
