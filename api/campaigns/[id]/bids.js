import { connectToDatabase, Campaign, AutoBid } from '../../_lib/db.js';

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

        const bids = await AutoBid.find({ campaignId: id })
            .populate('creatorId', 'name email')
            .lean();

        const mapped = bids.map(bid => ({
            _id: bid._id,
            campaignId: bid.campaignId,
            creatorId: {
                _id: bid.creatorId?._id,
                name: bid.creatorId?.name || 'Creator',
                email: bid.creatorId?.email
            },
            current_bid: bid.current_bid,
            status: bid.status,
            pitch: bid.pitch || 'I can deliver an engaging integration for your product.',
            negotiationLog: bid.negotiationLog || {
                round_history: [
                    { round: 1, price: bid.current_bid, concessions: 'None', reasoning: 'Initial ask', timestamp: new Date() }
                ]
            },
            profileStats: bid.profileStats || {
                followers: 50000,
                engagement: '3.1%',
                avg_comments: 40,
                target_audience: 'General Audience',
                product_category: 'Lifestyle',
                viralityScore: 5
            }
        }));

        return res.status(200).json(mapped);
    } catch (err) {
        console.error('Campaign bids error:', err);
        res.status(500).json({ error: err.message });
    }
}
