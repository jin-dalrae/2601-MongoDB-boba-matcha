const { Campaign, AutoBid } = require('../../models');

// Get all campaigns for an advertiser
exports.getCampaignsByAdvertiser = async (req, res) => {
  try {
    const { advertiserId } = req.params;
    const campaigns = await Campaign.find({ advertiserId })
      .sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all active campaigns (for creator discovery)
exports.getActiveCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ status: 'Active' })
      .populate('advertiserId', 'name email')
      .sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single campaign
exports.getCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('advertiserId', 'name email');
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create campaign
exports.createCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.create(req.body);
    res.status(201).json(campaign);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update campaign
exports.updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get campaign stats (creators involved, spent, etc.)
exports.getCampaignStats = async (req, res) => {
  try {
    const { id } = req.params;
    const autoBids = await AutoBid.find({ campaignId: id });
    const acceptedBids = autoBids.filter(bid => bid.status === 'Accepted');
    
    // Calculate total spent (simplified - would need contract data for actual amounts)
    const stats = {
      totalProposals: autoBids.length,
      acceptedProposals: acceptedBids.length,
      creatorsInvolved: new Set(autoBids.map(bid => bid.creatorId.toString())).size
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


