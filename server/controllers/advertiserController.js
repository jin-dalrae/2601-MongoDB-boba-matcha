const {
  Campaign,
  AutoBid,
  Contract,
  Shipment,
  ContentSubmission,
  AuditReport,
  X402Settlement,
  AgentLog,
  SharedMemory,
  SNSAccount,
} = require('../../models');

const formatDateLabel = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

const getCampaignStatusSummary = (campaigns, autoBids, contracts, settlements) => {
  const autoBidsByCampaign = new Map();
  const contractToCampaign = new Map();
  const spendByCampaign = new Map();

  autoBids.forEach((bid) => {
    const list = autoBidsByCampaign.get(bid.campaignId.toString()) || [];
    list.push(bid);
    autoBidsByCampaign.set(bid.campaignId.toString(), list);
  });

  contracts.forEach((contract) => {
    if (!contract.autoBidId) return;
    contractToCampaign.set(contract._id.toString(), contract.autoBidId.campaignId?.toString());
  });

  settlements.forEach((settlement) => {
    const campaignId = contractToCampaign.get(settlement.contractId.toString());
    if (!campaignId) return;
    const current = spendByCampaign.get(campaignId) || 0;
    spendByCampaign.set(campaignId, current + (settlement.total_paid || 0));
  });

  return campaigns.map((campaign) => {
    const campaignId = campaign._id.toString();
    const bids = autoBidsByCampaign.get(campaignId) || [];
    const creatorsActive = new Set(bids.map((bid) => bid.creatorId.toString())).size;
    const totalSpend = spendByCampaign.get(campaignId) || 0;

    return {
      id: campaign._id,
      name: campaign.title,
      status: campaign.status,
      budget: campaign.budget_limit || 0,
      totalSpend,
      creatorsActive
    };
  });
};

const buildTimeline = (campaign, autoBids, contracts, shipments, submissions, audits, settlements) => {
  const hasAccepted = autoBids.some((bid) => bid.status === 'Accepted');
  const hasBids = autoBids.length > 0;
  const contractCount = contracts.length;
  const shipmentCount = shipments.length;
  const submissionCount = submissions.length;
  const auditCount = audits.length;

  const settlementCompleted = settlements.filter((s) => ['Released', 'Settled'].includes(s.status)).length;
  const settlementCount = settlements.length;

  const stepStatus = (completed, active) => {
    if (completed) return 'completed';
    if (active) return 'active';
    return 'pending';
  };

  const createdAt = campaign.createdAt;
  const matchingStatus = stepStatus(hasAccepted, hasBids && !hasAccepted);
  const shipmentStatus = stepStatus(
    shipmentCount > 0 && shipments.every((s) => s.status === 'Delivered'),
    shipmentCount > 0 && shipments.some((s) => s.status !== 'Delivered')
  );
  const creationStatus = stepStatus(
    submissionCount > 0 && submissionCount === contractCount,
    contractCount > 0 && submissionCount < contractCount
  );
  const submissionStatus = stepStatus(
    submissionCount > 0 && submissionCount === contractCount,
    submissionCount > 0 && submissionCount < contractCount
  );
  const auditStatus = stepStatus(
    auditCount > 0 && auditCount === submissionCount,
    auditCount > 0 && auditCount < submissionCount
  );
  const paymentStatus = stepStatus(
    settlementCompleted > 0 && settlementCompleted === contractCount,
    settlementCount > 0 && settlementCompleted < contractCount
  );

  const timeline = [
    {
      step: 'Campaign Created',
      status: 'completed',
      date: formatDateLabel(createdAt)
    },
    {
      step: 'Creators Matched',
      status: matchingStatus,
      date: matchingStatus === 'completed' ? formatDateLabel(campaign.createdAt) : (matchingStatus === 'active' ? 'In progress' : 'Pending')
    },
    {
      step: 'Products Sent',
      status: shipmentStatus,
      date: shipmentStatus === 'completed' ? formatDateLabel(shipments.at(-1)?.deliveredAt || shipments.at(-1)?.shippedAt) : (shipmentStatus === 'active' ? 'In progress' : 'Pending')
    },
    {
      step: 'Content Creation',
      status: creationStatus,
      date: creationStatus === 'completed' ? formatDateLabel(submissions.at(-1)?.submitted_at) : (creationStatus === 'active' ? 'In progress' : 'Pending')
    },
    {
      step: 'Content Submitted',
      status: submissionStatus,
      date: submissionStatus === 'completed' ? formatDateLabel(submissions.at(-1)?.submitted_at) : (submissionStatus === 'active' ? 'In progress' : 'Pending')
    },
    {
      step: 'Audit Complete',
      status: auditStatus,
      date: auditStatus === 'completed' ? formatDateLabel(audits.at(-1)?.generatedAt) : (auditStatus === 'active' ? 'In progress' : 'Pending')
    },
    {
      step: 'Payment Released',
      status: paymentStatus,
      date: paymentStatus === 'completed' ? formatDateLabel(settlements.at(-1)?.createdAt) : (paymentStatus === 'active' ? 'In progress' : 'Pending')
    }
  ];

  return timeline;
};

exports.getAdvertiserOverview = async (req, res) => {
  try {
    const { advertiserId } = req.params;

    const campaigns = await Campaign.find({ advertiserId });
    const totalBudget = campaigns.reduce((sum, campaign) => sum + (campaign.budget_limit || 0), 0);

    const contracts = await Contract.find({ advertiserId });
    const contractIds = contracts.map((contract) => contract._id);
    const settlements = contractIds.length
      ? await X402Settlement.find({ contractId: { $in: contractIds } })
      : [];
    const spent = settlements.reduce((sum, settlement) => sum + (settlement.total_paid || 0), 0);

    const remaining = Math.max(totalBudget - spent, 0);

    let agentActivity = [];
    const sharedMemory = await SharedMemory.findOne({ entityId: advertiserId });
    if (sharedMemory) {
      const logs = await AgentLog.find({ sharedMemoryId: sharedMemory._id })
        .sort({ timestamp: -1 })
        .limit(10);
      agentActivity = logs.map((log) => ({
        id: log._id,
        text: log.details?.message || log.action || 'Agent update',
        timestamp: log.timestamp
      }));
    }

    res.json({
      budget: { total: totalBudget, spent, remaining },
      agentActivity
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAdvertiserCampaignSummaries = async (req, res) => {
  try {
    const { advertiserId } = req.params;
    const { limit } = req.query;

    const campaigns = await Campaign.find({ advertiserId }).sort({ createdAt: -1 });
    const campaignIds = campaigns.map((campaign) => campaign._id);

    const autoBids = campaignIds.length
      ? await AutoBid.find({ campaignId: { $in: campaignIds } })
      : [];
    const autoBidIds = autoBids.map((bid) => bid._id);

    const contracts = autoBidIds.length
      ? await Contract.find({ autoBidId: { $in: autoBidIds } }).populate('autoBidId', 'campaignId')
      : [];

    const contractIds = contracts.map((contract) => contract._id);
    const settlements = contractIds.length
      ? await X402Settlement.find({ contractId: { $in: contractIds } })
      : [];

    const summaries = getCampaignStatusSummary(campaigns, autoBids, contracts, settlements);

    res.json(limit ? summaries.slice(0, Number(limit)) : summaries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAdvertiserCampaignDetail = async (req, res) => {
  try {
    const { advertiserId, campaignId } = req.params;

    const campaign = await Campaign.findOne({ _id: campaignId, advertiserId });
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const autoBids = await AutoBid.find({ campaignId });
    const autoBidIds = autoBids.map((bid) => bid._id);
    const contracts = autoBidIds.length
      ? await Contract.find({ autoBidId: { $in: autoBidIds } })
        .populate('creatorId', 'name email')
        .populate('autoBidId', 'campaignId')
      : [];

    const contractIds = contracts.map((contract) => contract._id);
    const shipments = contractIds.length
      ? await Shipment.find({ contractId: { $in: contractIds } })
      : [];
    const submissions = contractIds.length
      ? await ContentSubmission.find({ contractId: { $in: contractIds } })
      : [];
    const audits = submissions.length
      ? await AuditReport.find({ submissionId: { $in: submissions.map((s) => s._id) } })
      : [];
    const settlements = contractIds.length
      ? await X402Settlement.find({ contractId: { $in: contractIds } })
      : [];

    const summary = getCampaignStatusSummary([campaign], autoBids, contracts, settlements)[0];

    const submissionsByContract = new Map();
    submissions.forEach((submission) => {
      submissionsByContract.set(submission.contractId.toString(), submission);
    });

    const auditsByContract = new Map();
    audits.forEach((audit) => {
      if (!audit.contractId) return;
      auditsByContract.set(audit.contractId.toString(), audit);
    });

    const settlementsByContract = new Map();
    settlements.forEach((settlement) => {
      settlementsByContract.set(settlement.contractId.toString(), settlement);
    });

    const creators = contracts.map((contract) => {
      const submission = submissionsByContract.get(contract._id.toString());
      const audit = auditsByContract.get(contract._id.toString());
      const settlement = settlementsByContract.get(contract._id.toString());

      let status = 'Negotiating';
      if (settlement) {
        status = 'Payment Released';
      } else if (audit) {
        status = 'Audited';
      } else if (submission) {
        status = 'Content Submitted';
      } else if (['Active', 'Signed'].includes(contract.status)) {
        status = 'Content Creation';
      }

      const auditResult = audit
        ? `Tier ${audit.tier_achieved} (${Math.round((audit.content_score || 0) * 100)}%)`
        : null;

      return {
        id: contract.creatorId?._id || contract._id,
        name: contract.creatorId?.name || 'Creator',
        status,
        auditResult,
        payout: settlement?.total_paid || null
      };
    });

    const timeline = buildTimeline(campaign, autoBids, contracts, shipments, submissions, audits, settlements);

    res.json({
      campaign: {
        id: campaign._id,
        name: campaign.title,
        status: campaign.status,
        budget: campaign.budget_limit || 0
      },
      summary,
      timeline,
      creators
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAdvertiserShortlist = async (req, res) => {
  try {
    const { advertiserId } = req.params;
    const { campaignId } = req.query;

    const campaign = campaignId
      ? await Campaign.findOne({ _id: campaignId, advertiserId })
      : await Campaign.findOne({ advertiserId }).sort({ createdAt: -1 });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const autoBids = await AutoBid.find({ campaignId: campaign._id }).populate('creatorId', 'name email');
    const creatorIds = autoBids.map((bid) => bid.creatorId?._id).filter(Boolean);
    const snsAccounts = creatorIds.length
      ? await SNSAccount.find({ userId: { $in: creatorIds } })
      : [];
    const sharedMemories = creatorIds.length
      ? await SharedMemory.find({ entityId: { $in: creatorIds } })
      : [];

    const snsByUser = new Map();
    snsAccounts.forEach((account) => {
      if (!snsByUser.has(account.userId.toString())) {
        snsByUser.set(account.userId.toString(), account);
      }
    });

    const memoryByUser = new Map();
    sharedMemories.forEach((memory) => {
      memoryByUser.set(memory.entityId.toString(), memory);
    });

    const creators = autoBids.map((bid) => {
      const creatorId = bid.creatorId?._id?.toString();
      const sns = creatorId ? snsByUser.get(creatorId) : null;
      const memory = creatorId ? memoryByUser.get(creatorId) : null;
      const reliability = memory?.reliability_score ? Math.round(memory.reliability_score * 100) : null;

      return {
        dealId: bid._id,
        id: creatorId || bid._id,
        name: bid.creatorId?.name || 'Creator',
        handle: sns?.handle || '—',
        platform: sns?.platform || 'Unknown',
        fitScore: reliability,
        bidAmount: bid.current_bid || 0,
        status: bid.status,
        tags: [],
        aiRecommended: bid.status === 'Accepted',
        followers: null,
        engagementRate: null,
        audienceMatch: reliability,
        contentQuality: reliability,
        reliability,
        reasoning: bid.status === 'Accepted'
          ? 'Accepted bid with aligned budget and timeline.'
          : 'Awaiting negotiation outcome.',
        risk: reliability && reliability >= 80 ? 'low' : 'medium'
      };
    });

    res.json({
      campaign: {
        id: campaign._id,
        name: campaign.title,
        goal: campaign.product_info?.description || 'Campaign goal not set yet.',
        budgetRange: campaign.budget_limit ? `$${campaign.budget_limit.toLocaleString()}` : '—',
        timeline: campaign.createdAt ? formatDateLabel(campaign.createdAt) : '—'
      },
      creators,
      reportMetrics: {
        impressions: null,
        engagementRate: null,
        costPerResult: null,
        creatorDistribution: []
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
