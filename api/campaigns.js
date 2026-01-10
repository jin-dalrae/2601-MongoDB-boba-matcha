import { connectToDatabase, User, Campaign, AutoBid, Contract } from './_lib/db.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        await connectToDatabase();

        // Check if this is a detail request (has ID in query)
        const { id } = req.query;

        if (id) {
            // Single campaign detail
            const campaign = await Campaign.findById(id);
            if (!campaign) {
                return res.status(404).json({ error: 'Campaign not found' });
            }

            // Matches (AutoBids)
            const autoBids = await AutoBid.find({ campaignId: id }).populate('creatorId', 'name email');
            const matches = autoBids.map(bid => ({
                id: bid.creatorId?._id,
                name: bid.creatorId?.name || 'Unknown',
                platform: 'TikTok',
                fitScore: 85,
                bid: bid.current_bid,
                status: bid.status
            }));

            // Contracts
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

            return res.status(200).json({
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

        } else {
            // List all campaigns
            const advertiser = await User.findOne({ role: 'Advertiser' });
            const campaigns = await Campaign.find({ advertiserId: advertiser._id });

            const result = await Promise.all(campaigns.map(async c => {
                const bids = await AutoBid.find({ campaignId: c._id });
                return {
                    id: c._id,
                    name: c.title,
                    status: c.status,
                    creators: bids.length,
                    spent: 0,
                    budget: c.budget_limit
                };
            }));

            return res.status(200).json(result);
        }

    } catch (err) {
        console.error("Campaigns Error:", err);
        res.status(500).json({ error: err.message });
    }
}
