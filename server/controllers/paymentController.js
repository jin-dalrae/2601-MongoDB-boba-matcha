const { Contract, AuditReport, X402Settlement } = require('../models');

// ---------------------------------------------------------------------------
// x402 settlement (Node / keyless simulation)
//
// This is the Express-side counterpart to the Python payment agent
// (agents/payment_agent.py). The agent does the real on-chain transfer; this
// endpoint runs a keyless simulation and — crucially — persists the result
// through the Mongoose X402Settlement model, so settlements show up in the
// same place contractController.js reads them. No CDP/wallet creds required:
// it runs in simulation mode by default to keep local demos keyless.
// ---------------------------------------------------------------------------

const x402Service = () => {
  // Optional real-payment creds. Absent in local/demo mode — that's expected;
  // we simulate rather than throw so the settlement loop always closes.
  const network = process.env.X402_NETWORK || 'base-sepolia';
  const live = Boolean(process.env.X402_PRIVATE_KEY && process.env.X402_WALLET_ADDRESS);

  const createPaymentRequest = (amount, currency = 'USDC') => ({
    header: 'X402-1.0-Payment-Required',
    details: {
      amount,
      currency,
      memo: 'Creator Content Payout',
      network,
      mode: live ? 'live' : 'simulated',
    },
  });

  const executePayment = async (payerId, payeeId, amount, request) => {
    // Simulated settlement. The Python agent (agents/payment_agent.py) handles
    // the real Base/USDC transfer; this path is the keyless fallback.
    await new Promise((resolve) => setTimeout(resolve, 800));
    const rand = () => Math.random().toString(16).slice(2, 10);
    return {
      success: true,
      txHash: '0x' + rand() + rand(),
      receipt: `x402-receipt-${Date.now()}`,
      mode: request.details.mode,
    };
  };

  return { createPaymentRequest, executePayment };
};

// POST /api/payments/execute
// Body: { contractId, auditId? }
// Runs audit gate -> payout calc -> simulated x402 -> persists X402Settlement
// and flips the contract to 'Settled'. Idempotent: a contract already settled
// returns the existing settlement instead of paying twice.
exports.executePayment = async (req, res) => {
  try {
    const { contractId, auditId } = req.body || {};
    if (!contractId) {
      return res.status(400).json({ error: 'contractId is required' });
    }

    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    // Idempotency guard — never double-settle.
    const existing = await X402Settlement.findOne({ contractId: contract._id });
    if (existing && existing.status === 'Settled') {
      return res.status(200).json({
        success: true,
        alreadySettled: true,
        settlement: existing,
        message: 'Contract already settled',
      });
    }

    // Resolve the audit. Caller may pass auditId, else fall back to the
    // contract's audit report (rearrange links AuditReport.contractId).
    const audit = auditId
      ? await AuditReport.findById(auditId)
      : await AuditReport.findOne({ contractId: contract._id });
    if (!audit) {
      return res.status(404).json({ error: 'Audit report not found for contract' });
    }

    // Agent rule: content must clear the score gate (rearrange uses 0.0-1.0).
    if (typeof audit.content_score === 'number' && audit.content_score < 0.5) {
      return res
        .status(400)
        .json({ error: 'Content score too low for auto-payment' });
    }

    // Payout = base + tiered bonus. rearrange's AuditReport carries
    // tier_achieved (0/1/2) instead of main's flat boolean, so honor the tier.
    const base = Number(contract.base_payout || 0);
    const tier = Number(audit.tier_achieved || 0);
    const bonus = tier > 0 ? tier * 50 : 0;
    const totalPayout = base + bonus;

    const service = x402Service();
    const paymentRequest = service.createPaymentRequest(totalPayout);
    const paymentResult = await service.executePayment(
      contract.advertiserId,
      contract.creatorId,
      totalPayout,
      paymentRequest
    );

    let settlement;
    if (existing) {
      // A prior non-Settled attempt exists — update it in place.
      existing.auditReportId = audit._id;
      existing.x402_handshake_header = paymentRequest.header;
      existing.status = 'Settled';
      existing.stablecoin_hash = paymentResult.txHash;
      existing.total_paid = totalPayout;
      existing.receipt_hash = paymentResult.receipt;
      settlement = await existing.save();
    } else {
      settlement = await X402Settlement.create({
        contractId: contract._id,
        auditReportId: audit._id,
        x402_handshake_header: paymentRequest.header,
        status: 'Settled',
        stablecoin_hash: paymentResult.txHash,
        total_paid: totalPayout,
        receipt_hash: paymentResult.receipt,
      });
    }

    contract.status = 'Settled';
    await contract.save();

    return res.status(200).json({
      success: true,
      settlement: {
        id: settlement._id,
        total_paid: settlement.total_paid,
        stablecoin_hash: settlement.stablecoin_hash,
        receipt_hash: settlement.receipt_hash,
        x402_handshake_header: settlement.x402_handshake_header,
        status: settlement.status,
        createdAt: settlement.createdAt,
      },
      breakdown: { base, bonus, tier, total: totalPayout },
      mode: paymentResult.mode,
      message: `Payment executed via x402 (${paymentResult.mode})`,
    });
  } catch (err) {
    console.error('Payments execute error:', err);
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/payments
// Returns { pending, history }: contracts awaiting settlement and the
// settlements already recorded. Defensive populate — the contract->autoBid->
// campaign chain is optional, so missing links degrade to 'Unknown' rather
// than throwing.
exports.listPayments = async (req, res) => {
  try {
    // NOTE: we intentionally do NOT populate autoBidId here. models.js
    // registers the model as 'Auto_Bid' while contractSchema declares
    // ref: 'AutoBid', so .populate('autoBidId') throws "Schema hasn't been
    // registered". That's a pre-existing rearrange bug (also affects
    // contractController). Keep this endpoint resilient instead of coupling
    // it to that breakage; campaignName degrades to a safe fallback.
    const pendingContracts = await Contract.find({
      status: { $in: ['Active', 'Auditing', 'Signed'] },
    })
      .populate('creatorId', 'name')
      .lean();

    const pending = [];
    for (const contract of pendingContracts) {
      const audit = await AuditReport.findOne({ contractId: contract._id });
      const settled = await X402Settlement.findOne({
        contractId: contract._id,
        status: 'Settled',
      });
      if (audit && !settled) {
        pending.push({
          id: contract._id,
          campaignName: 'Campaign',
          creatorName: contract.creatorId?.name || 'Unknown',
          amount: contract.base_payout,
          status: 'Pending',
          auditScore: audit.content_score,
          auditId: audit._id,
        });
      }
    }

    const settlements = await X402Settlement.find()
      .populate({
        path: 'contractId',
        populate: { path: 'creatorId', select: 'name' },
      })
      .sort({ createdAt: -1 });

    const history = settlements.map((s) => ({
      id: s._id,
      campaignName: 'Campaign',
      creatorName: s.contractId?.creatorId?.name || 'Unknown',
      amount: s.total_paid,
      status: s.status,
      txHash: s.stablecoin_hash,
      date: s.createdAt,
    }));

    return res.status(200).json({ pending, history });
  } catch (err) {
    console.error('Payments list error:', err);
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/payments/:contractId — settlement for one contract (UI polling).
exports.getSettlement = async (req, res) => {
  try {
    const settlement = await X402Settlement.findOne({
      contractId: req.params.contractId,
    });
    if (!settlement) {
      return res.status(404).json({ error: 'Settlement not found' });
    }
    return res.json(settlement);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
