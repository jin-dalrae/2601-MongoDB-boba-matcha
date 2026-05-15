const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.get('/', paymentController.listPayments);
router.post('/execute', paymentController.executePayment);
router.get('/:contractId', paymentController.getSettlement);

module.exports = router;
