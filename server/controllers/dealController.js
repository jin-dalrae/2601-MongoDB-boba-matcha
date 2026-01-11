const { AutoBid, Campaign, User, NegotiationLog } = require('../../models');

// Get deals (AutoBids) for a creator
exports.getDealsByCreator = async (req, res) => {
  try {
    const { creatorId } = req.params;
    const deals = await AutoBid.find({ creatorId })
      .populate('campaignId', 'title product_info budget_limit')
      .populate('campaignId.advertiserId', 'name')
      .sort({ createdAt: -1 });
    res.json(deals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get deals by status for creator
exports.getDealsByCreatorAndStatus = async (req, res) => {
  try {
    const { creatorId, status } = req.params;
    const deals = await AutoBid.find({ creatorId, status })
      .populate('campaignId', 'title product_info budget_limit')
      .populate('campaignId.advertiserId', 'name')
      .sort({ createdAt: -1 });
    res.json(deals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get deals (AutoBids) for an advertiser's campaign (shortlist)
exports.getDealsByCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const deals = await AutoBid.find({ campaignId })
      .populate('creatorId', 'name email')
      .sort({ createdAt: -1 });
    res.json(deals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single deal with negotiation history
exports.getDeal = async (req, res) => {
  try {
    const deal = await AutoBid.findById(req.params.id)
      .populate('campaignId', 'title product_info budget_limit')
      .populate('creatorId', 'name email');
    
    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    const negotiationLog = await NegotiationLog.findOne({ autoBidId: deal._id });
    
    res.json({
      deal,
      negotiationLog
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create deal (AutoBid)
exports.createDeal = async (req, res) => {
  try {
    const deal = await AutoBid.create(req.body);
    res.status(201).json(deal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update deal (AutoBid) - for negotiations
exports.updateDeal = async (req, res) => {
  try {
    const deal = await AutoBid.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }
    res.json(deal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

