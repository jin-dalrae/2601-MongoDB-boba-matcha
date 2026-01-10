import { connectToDatabase, User, Campaign, AutoBid, Contract, X402Settlement, AgentLog } from './_lib/db.js';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        await connectToDatabase();

        // Get demo advertiser
        const advertiser = await User.findOne({ role: 'Advertiser' });
        if (!advertiser) {
            return res.status(404).json({ error: 'No advertiser found' });
        }

        // Campaigns
        const campaigns = await Campaign.find({ advertiserId: advertiser._id });
        const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget_limit || 0), 0);

        // Calculate Spent
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
            const bids = await AutoBid.find({ campaignId: c._id });
            recentCampaigns.push({
                id: c._id,
                name: c.title,
                status: c.status,
                creators: bids.length,
                spent: 0
            });
        }

        res.status(200).json({
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
}
