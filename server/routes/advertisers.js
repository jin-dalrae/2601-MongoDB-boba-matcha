const express = require('express');
const router = express.Router();
const advertiserController = require('../controllers/advertiserController');

router.get('/:advertiserId/overview', advertiserController.getAdvertiserOverview);
router.get('/:advertiserId/campaigns/summary', advertiserController.getAdvertiserCampaignSummaries);
router.get('/:advertiserId/campaigns/:campaignId/detail', advertiserController.getAdvertiserCampaignDetail);
router.get('/:advertiserId/shortlist', advertiserController.getAdvertiserShortlist);
router.get('/sample', advertiserController.getSampleAdvertiser);

module.exports = router;
