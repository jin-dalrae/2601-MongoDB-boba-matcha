import { connectToDatabase, Contract, AuditReport, X402Settlement } from '../_lib/db.js';

const setCors = (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

// Minimal x402 helper that acknowledges CDP credentials without exposing them
const x402Service = () => {
    const apiKey = process.env.CDP_API_KEY;
    const apiSecret = process.env.CDP_API_SECRET;

    const ensureCreds = () => {
        if (!apiKey || !apiSecret) {
            throw new Error('CDP credentials missing: set CDP_API_KEY and CDP_API_SECRET');
        }
    };

    const createPaymentRequest = (amount, currency = 'USDC') => {
        ensureCreds();
        return {
            header: 'X402-1.0-Payment-Required',
            details: {
                amount,
                currency,
                memo: 'Creator Content Payout',
                provider: 'cdp',
                keyHint: apiKey ? apiKey.slice(-4) : undefined
            }
        };
    };

    const executePayment = async (payerId, payeeId, amount, request) => {
        ensureCreds();
        // Simulated settlement; in production call the CDP client with the creds above.
        await new Promise(resolve => setTimeout(resolve, 1200));
        return {
            success: true,
            txHash: '0x' + Math.random().toString(16).slice(2, 10) + Math.random().toString(16).slice(2, 10),
            receipt: `x402-receipt-${Date.now()}`,
            provider: request.details.provider
        };
    };

    return { createPaymentRequest, executePayment };
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
        const { contractId, auditId } = req.body || {};
        if (!contractId || !auditId) {
            return res.status(400).json({ error: 'contractId and auditId are required' });
        }

        await connectToDatabase();

        const contract = await Contract.findById(contractId);
        if (!contract) return res.status(404).json({ error: 'Contract not found' });

        const audit = await AuditReport.findById(auditId);
        if (!audit) return res.status(404).json({ error: 'Audit not found' });

        // Agent rule: require passing content score
        if (typeof audit.content_score === 'number' && audit.content_score < 0.5) {
            return res.status(400).json({ error: 'Content score too low for auto-payment' });
        }

        // Compute payout (base + simple bonus if audit passed)
        let totalPayout = Number(contract.base_payout || 0);
        if (audit.passed) {
            totalPayout += 50; // mock bonus for passed audit
        }

        const service = x402Service();
        const paymentRequest = service.createPaymentRequest(totalPayout);
        const paymentResult = await service.executePayment(
            contract.advertiserId,
            contract.creatorId,
            totalPayout,
            paymentRequest
        );

        const settlement = await X402Settlement.create({
            contractId: contract._id,
            auditReportId: audit._id,
            x402_handshake_header: paymentRequest.header,
            status: 'Settled',
            stablecoin_hash: paymentResult.txHash,
            total_paid: totalPayout,
            receipt_hash: paymentResult.receipt
        });

        contract.status = 'Settled';
        await contract.save();

        return res.status(200).json({
            success: true,
            settlement: {
                id: settlement._id,
                total_paid: settlement.total_paid,
                stablecoin_hash: settlement.stablecoin_hash,
                x402_handshake_header: settlement.x402_handshake_header,
                status: settlement.status,
                createdAt: settlement.createdAt
            },
            message: 'Payment executed via x402 (simulated)'
        });
    } catch (err) {
        console.error('Payments execute error:', err);
        return res.status(500).json({ error: err.message });
    }
}
