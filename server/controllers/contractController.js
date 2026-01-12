const {
  Contract, AutoBid, Campaign, User,
  ContentSubmission, AuditReport, X402Settlement
} = require('../../models');

// Get contracts for a creator
exports.getContractsByCreator = async (req, res) => {
  try {
    const { creatorId } = req.params;
    const contracts = await Contract.find({ creatorId })
      .populate('advertiserId', 'name email')
      .populate('autoBidId', 'campaignId current_bid')
      .populate('autoBidId.campaignId', 'title')
      .sort({ createdAt: -1 });
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get contracts for an advertiser
exports.getContractsByAdvertiser = async (req, res) => {
  try {
    const { advertiserId } = req.params;
    const contracts = await Contract.find({ advertiserId })
      .populate('creatorId', 'name email')
      .populate('autoBidId', 'campaignId current_bid')
      .populate('autoBidId.campaignId', 'title')
      .sort({ createdAt: -1 });
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get contract by ID with full details
exports.getContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('advertiserId', 'name email')
      .populate('creatorId', 'name email')
      .populate('autoBidId', 'campaignId current_bid')
      .populate('autoBidId.campaignId', 'title product_info');

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    // Get related data
    const submission = await ContentSubmission.findOne({ contractId: contract._id });
    const auditReport = submission
      ? await AuditReport.findOne({ submissionId: submission._id })
      : null;
    const settlement = await X402Settlement.findOne({ contractId: contract._id });

    res.json({
      contract,
      submission,
      auditReport,
      settlement
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get active contracts (ActiveCampaigns page)
exports.getActiveContracts = async (req, res) => {
  try {
    const { creatorId } = req.query;
    const query = { status: { $in: ['Active', 'Auditing', 'Signed'] } };
    if (creatorId) {
      query.creatorId = creatorId;
    }

    const contracts = await Contract.find(query)
      .populate('advertiserId', 'name')
      .populate('creatorId', 'name')
      .populate('autoBidId', 'campaignId')
      .populate('autoBidId.campaignId', 'title')
      .sort({ createdAt: -1 });

    res.json(contracts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create contract
exports.createContract = async (req, res) => {
  try {
    const contract = await Contract.create(req.body);
    res.status(201).json(contract);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update contract
exports.updateContract = async (req, res) => {
  try {
    const contract = await Contract.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    res.json(contract);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get contracts with submissions for advertiser results page
exports.getContractsWithSubmissions = async (req, res) => {
  try {
    const { advertiserId } = req.params;

    const contracts = await Contract.find({ advertiserId })
      .populate('creatorId', 'name email')
      .populate({
        path: 'autoBidId',
        populate: {
          path: 'campaignId',
          select: 'title product_info'
        }
      })
      .sort({ createdAt: -1 });

    // Get submissions, audits, and settlements for each contract
    const contractsWithDetails = await Promise.all(
      contracts.map(async (contract) => {
        const submission = await ContentSubmission.findOne({ contractId: contract._id });
        const auditReport = submission
          ? await AuditReport.findOne({ submissionId: submission._id })
          : null;
        const settlement = await X402Settlement.findOne({ contractId: contract._id });

        return {
          ...contract.toObject(),
          submission,
          auditReport,
          settlement
        };
      })
    );

    res.json(contractsWithDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

