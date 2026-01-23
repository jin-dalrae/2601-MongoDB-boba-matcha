const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');

router.get('/advertiser/:advertiserId', campaignController.getCampaignsByAdvertiser);
router.get('/active', campaignController.getActiveCampaigns);
router.get('/:id/stats', campaignController.getCampaignStats);
router.get('/:id', campaignController.getCampaign);
router.post('/', campaignController.createCampaign);
router.put('/:id', campaignController.updateCampaign);

module.exports = router;



