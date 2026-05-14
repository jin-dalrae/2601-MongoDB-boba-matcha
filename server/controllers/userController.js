const {
  User, SNSAccount, AgentConfig, Wallet, SharedMemory,
  AutoBid, Contract, X402Settlement, AgentLog,
} = require('../models');

// Get user by ID
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all users by role
exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const users = await User.find({ role });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user with related data (wallet, config, etc.)
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const wallet = await Wallet.findOne({ userId });
    const agentConfig = await AgentConfig.findOne({ userId });
    const snsAccounts = await SNSAccount.find({ userId });
    const sharedMemory = await SharedMemory.findOne({ entityId: userId });

    res.json({
      user,
      wallet,
      agentConfig,
      snsAccounts,
      sharedMemory
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Aggregated dashboard data for a creator
exports.getCreatorDashboard = async (req, res) => {
  try {
    const creatorId = req.params.id;

    const user = await User.findById(creatorId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const [contracts, negotiatingCount, sharedMemory] = await Promise.all([
      Contract.find({ creatorId })
        .populate('advertiserId', 'name')
        .populate({
          path: 'autoBidId',
          select: 'campaignId current_bid',
          populate: { path: 'campaignId', select: 'title product_info' },
        })
        .sort({ createdAt: -1 })
        .lean(),
      AutoBid.countDocuments({ creatorId, status: { $in: ['Negotiating', 'Proposed'] } }),
      SharedMemory.findOne({ entityId: creatorId }).lean(),
    ]);

    const contractIds = contracts.map((c) => c._id);
    const settlements = await X402Settlement.find({ contractId: { $in: contractIds } }).lean();
    const settlementByContract = {};
    for (const s of settlements) {
      settlementByContract[String(s.contractId)] = s;
    }

    let totalEarned = 0;
    let bonusesEarned = 0;
    let pendingPayouts = 0;
    let completedCount = 0;
    const activeStatuses = new Set(['Active', 'Signed', 'Auditing']);

    const activePacts = [];
    for (const c of contracts) {
      const settlement = settlementByContract[String(c._id)];
      if (settlement) {
        totalEarned += settlement.total_paid || 0;
        bonusesEarned += Math.max((settlement.total_paid || 0) - (c.base_payout || 0), 0);
        completedCount += 1;
      } else if (activeStatuses.has(c.status)) {
        pendingPayouts += c.base_payout || 0;
        activePacts.push({
          _id: c._id,
          brand: c.advertiserId?.name || 'Brand',
          campaign: c.autoBidId?.campaignId?.title || 'Campaign',
          base_payout: c.base_payout,
          status: c.status,
          createdAt: c.createdAt,
        });
      }
    }

    const agentActivity = sharedMemory
      ? await AgentLog.find({ sharedMemoryId: sharedMemory._id })
          .sort({ timestamp: -1 })
          .limit(8)
          .lean()
      : [];

    res.json({
      earnings: {
        totalEarned,
        pendingPayouts,
        bonusesEarned,
        contractsActive: activePacts.length,
        contractsCompleted: completedCount,
      },
      activePacts,
      agentActivity: agentActivity.map((log) => ({
        id: String(log._id),
        message: log.details?.message || log.action || 'Agent event',
        timestamp: log.timestamp,
        type: log.action || 'event',
      })),
      negotiatingCount,
      reputation: sharedMemory
        ? {
            reliability_score: sharedMemory.reliability_score,
          }
        : null,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create user
exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



