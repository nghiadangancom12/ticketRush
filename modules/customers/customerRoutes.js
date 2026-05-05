const express = require('express');
const router = express.Router();
const customerController = require('./customerController');
const { verifyToken } = require('../../middlewares/authMiddleware');

// Protected routes (require authentication)
//router.get('/me', verifyToken, customerController.getProfile);
//router.patch('/me', verifyToken, customerController.updateProfile);
router.get('/purchaseHistory', verifyToken, customerController.getPurchaseHistory);


module.exports = router;
