const express = require('express');
const router = express.Router();
const dealController = require('../controllers/dealController');

router.get('/creator/:creatorId', dealController.getDealsByCreator);
router.get('/creator/:creatorId/status/:status', dealController.getDealsByCreatorAndStatus);
router.get('/campaign/:campaignId', dealController.getDealsByCampaign);
router.get('/:id', dealController.getDeal);
router.post('/', dealController.createDeal);
router.put('/:id', dealController.updateDeal);

module.exports = router;


