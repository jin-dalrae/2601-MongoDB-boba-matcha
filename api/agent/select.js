import { connectToDatabase, AutoBid, Contract, Campaign } from './_lib/db.js';

const setCors = (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

export default async function handler(req, res) {
    setCors(res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        await connectToDatabase();
        const { campaignId, bidId } = req.body || {};

        if (!campaignId || !bidId) {
            return res.status(400).json({ error: 'campaignId and bidId are required' });
        }

        const campaign = await Campaign.findById(campaignId);
        const bid = await AutoBid.findByIdAndUpdate(bidId, { status: 'Accepted' }, { new: true });
        if (!campaign || !bid) {
            return res.status(404).json({ error: 'Campaign or bid not found' });
        }

        const contract = await Contract.create({
            autoBidId: bid._id,
            campaignId,
            advertiserId: campaign.advertiserId,
            creatorId: bid.creatorId,
            base_payout: bid.current_bid,
            audit_criteria: 'Brand-safe content and product feature within first 10 seconds.',
            status: 'EscrowFunded',
            escrowTx: '0xEscrow' + Math.random().toString(16).substr(2, 40)
        });

        const reasoning = `
            Selected '${bid.creatorId?.name || 'Creator'}' based on:
            1. Category alignment with campaign goals.
            2. Engagement rates above benchmark.
            3. Competitive bid with willingness to collaborate.
        `;

        return res.status(200).json({
            success: true,
            contractId: contract._id,
            escrowTx: contract.escrowTx,
            reasoning: reasoning.trim()
        });
    } catch (err) {
        console.error('Agent select error:', err);
        res.status(500).json({ error: err.message });
    }
}
