import { connectToDatabase, Campaign, AutoBid, Contract } from '../_lib/db.js';

const setCors = (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

export default async function handler(req, res) {
    setCors(res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        await connectToDatabase();
        const { id } = req.query;

        const campaign = await Campaign.findById(id);
        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        const autoBids = await AutoBid.find({ campaignId: id })
            .populate('creatorId', 'name email')
            .lean();
        const autoBidIds = autoBids.map(b => b._id);

        const contracts = await Contract.find({ autoBidId: { $in: autoBidIds } })
            .populate('creatorId', 'name')
            .lean();

        const matches = autoBids.map(bid => ({
            id: bid.creatorId?._id,
            name: bid.creatorId?.name || 'Unknown Creator',
            platform: 'TikTok',
            fitScore: 85,
            bid: bid.current_bid,
            status: bid.status
        }));

        const contractList = contracts.map(c => ({
            id: c._id,
            title: 'Influencer Agreement',
            type: 'Master Service Agreement',
            status: c.status,
            version: '1.0',
            lastUpdated: c.updatedAt || c.createdAt || new Date(),
            parties: ['Matcha', c.creatorId?.name || 'Creator'],
            clauses: [
                { title: 'Scope of Work', text: c.audit_criteria || 'Pending audit criteria.' },
                { title: 'Payment', text: `Total base payout of $${c.base_payout || 0} upon completion.` }
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
    } catch (err) {
        console.error('Campaign detail error:', err);
        res.status(500).json({ error: err.message });
    }
}
