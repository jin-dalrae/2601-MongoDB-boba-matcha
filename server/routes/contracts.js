const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');

router.get('/creator/:creatorId', contractController.getContractsByCreator);
router.get('/advertiser/:advertiserId', contractController.getContractsByAdvertiser);
router.get('/active', contractController.getActiveContracts);
router.get('/:id', contractController.getContract);
router.post('/', contractController.createContract);
router.put('/:id', contractController.updateContract);

module.exports = router;

