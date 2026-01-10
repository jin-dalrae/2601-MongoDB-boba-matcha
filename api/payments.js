import { connectToDatabase, Contract, AutoBid, AuditReport, X402Settlement } from './_lib/db.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        await connectToDatabase();

        if (req.method === 'GET') {
            // Pending payments
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

            // History (Settlements)
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

            return res.status(200).json({ pending, history });

        } else if (req.method === 'POST') {
            // Execute payment
            const { contractId, amount } = req.body;

            const settlement = new X402Settlement({
                contractId,
                total_paid: amount,
                tx_hash: `0x${Date.now().toString(16)}`,
                status: 'Settled'
            });

            await settlement.save();
            await Contract.findByIdAndUpdate(contractId, { status: 'Settled' });

            return res.status(200).json({ success: true, settlement });
        }

    } catch (err) {
        console.error("Payments Error:", err);
        res.status(500).json({ error: err.message });
    }
}
