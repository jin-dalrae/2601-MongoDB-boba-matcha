const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const {
    Contract, AuditReport, X402Settlement, User, Wallet
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

// Get pending payments (Contracts with Audit Reports but no Settlement)
app.get('/api/payments/pending', async (req, res) => {
    try {
        // Find contracts that are active
        const pendingContracts = await Contract.find({ status: { $in: ['Active', 'Auditing'] } })
            .populate('creatorId', 'name email role')
            .populate('advertiserId', 'name')
            .lean();

        const results = [];

        for (const contract of pendingContracts) {
            // Check if there is an audit report
            const audit = await AuditReport.findOne({ contractId: contract._id });
            if (!audit) continue; // No audit yet, skip

            // Check if already settled
            const settlement = await X402Settlement.findOne({ contractId: contract._id });
            if (settlement && settlement.status === 'Settled') continue;

            results.push({
                contract,
                audit,
                readyForPayment: true
            });
        }

        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Execute Payment (The "Agent" Logic)
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
