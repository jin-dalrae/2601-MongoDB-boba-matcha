const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/:id', userController.getUser);
router.get('/role/:role', userController.getUsersByRole);
router.get('/:id/profile', userController.getUserProfile);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);

module.exports = router;

