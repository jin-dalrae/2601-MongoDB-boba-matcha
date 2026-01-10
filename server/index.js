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

    // Campaign 1: Tech Gadget Showcase (Rich Demo)
    const camp1 = {
        _id: 'camp_1',
        advertiserId: 'user_1',
        title: 'Smart Home Hub Launch',
        product_info: {
            name: 'Nexus Hub X',
            description: 'AI-powered smart home controller for modern living.',
            requires_shipping: true,
            keep_product: true
        },
        budget_limit: 8000,
        status: 'Matching',
        deadline: new Date(Date.now() + 172800000).toISOString(), // 48h
        createdAt: new Date()
    };
    campaigns.push(camp1);

    // Bid 1: High Reach, Low Engagement (Common Mismatch)
    bids.push({
        _id: 'bid_1',
        campaignId: 'camp_1',
        creatorId: { _id: 'u2', name: 'Mega Gamer', role: 'Creator' },
        current_bid: 7500,
        status: 'Proposed',
        pitch: "I'll feature this in my monthly setup tour. My audience loves tech.",
        negotiationLog: {
            round_history: [
                { round: 1, price: 7500, concessions: 'None', reasoning: 'Standard integration rate', timestamp: new Date(Date.now() - 100000) }
            ]
        },
        profileStats: {
            followers: 1200000,
            engagement: '0.8%',
            avg_comments: 120,
            target_audience: 'Gen Z Gamers',
            product_category: 'Gaming Peripherals',
            viralityScore: 9
        }
    });

    // Bid 2: Perfect Match (Niche, High Engagement)
    bids.push({
        _id: 'bid_2',
        campaignId: 'camp_1',
        creatorId: { _id: 'u3', name: 'Tech Life Jane', role: 'Creator' },
        current_bid: 4500,
        status: 'Proposed',
        pitch: "I focus on smart home automation. I can do a deep-dive review + installation guide.",
        negotiationLog: {
            round_history: [
                { round: 1, price: 5000, concessions: 'None', reasoning: 'Deep dive video takes time', timestamp: new Date(Date.now() - 80000) },
                { round: 2, price: 4500, concessions: 'Will add an IG Reel', reasoning: 'Love the product', timestamp: new Date() }
            ]
        },
        profileStats: {
            followers: 85000,
            engagement: '6.5%',
            avg_comments: 450,
            target_audience: 'Homeowners & Tech Enthusiasts',
            product_category: 'Smart Home',
            viralityScore: 5
        }
    });

    // Bid 3: Low Reach, Wrong Category
    bids.push({
        _id: 'bid_3',
        campaignId: 'camp_1',
        creatorId: { _id: 'u4', name: 'Fitness Frank', role: 'Creator' },
        current_bid: 1000,
        status: 'Proposed',
        pitch: "I can use it to control my gym music.",
        negotiationLog: {
            round_history: [
                { round: 1, price: 1000, concessions: 'None', reasoning: 'Quick shoutout', timestamp: new Date() }
            ]
        },
        profileStats: {
            followers: 15000,
            engagement: '2.1%',
            avg_comments: 15,
            target_audience: 'Gym Goers',
            product_category: 'Fitness',
            viralityScore: 2
        }
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
            productName, shipProduct, keepProduct, deadline
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
            deadline: deadline || new Date(Date.now() + 86400000).toISOString(), // Default 24h
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
        }, 5000); // 5 seconds delay

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

// New Endpoint: POST /api/bids (Manual Bid)
app.post('/api/bids', (req, res) => {
    try {
        const { campaignId, bidAmount, reasoning } = req.body;

        const newBid = {
            _id: 'bid_man_' + Date.now(),
            campaignId,
            creatorId: users[3], // 'Charlie Vlog' (Simulating 'You' as the logged in creator)
            current_bid: Number(bidAmount),
            status: 'Proposed',
            negotiationLog: {
                round_history: [
                    {
                        round: 1,
                        price: Number(bidAmount),
                        concessions: 'N/A',
                        reasoning: reasoning || 'Manual Bid',
                        timestamp: new Date()
                    }
                ]
            },
            profileStats: { followers: 5000, engagement: '6.0%', category: 'General', viralityScore: 2 }
        };

        bids.push(newBid);
        res.status(201).json(newBid);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
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
            Selected 'Tech Life Jane' because:
            1. **Category Match**: 'Smart Home' aligns perfectly with 'Nexus Hub X'.
            2. **High Engagement**: 6.5% engagement and 450 avg comments indicates an active community.
            3. **Target Audience**: Reaches 'Homeowners & Tech Enthusiasts' who are likely to buy.
            4. **Negotiation**: Willing to include an IG Reel for a lower price ($4500) than the initial ask.
            
            'Mega Gamer' had more followers but lower engagement and mismatched audience. 'Fitness Frank' was not relevant.
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
