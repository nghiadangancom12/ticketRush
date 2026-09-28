const express = require('express');
const router = express.Router();
const customerController = require('./customerController');
const { verifyToken } = require('../../../shared/middlewares/authMiddleware');

router.get('/purchaseHistory', verifyToken, customerController.getPurchaseHistory);

module.exports = router;
