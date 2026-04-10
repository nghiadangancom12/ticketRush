const express = require('express');
const router = express.Router();
const adminController = require('./adminController');
const { verifyToken, isAdmin } = require('../auth/auth.middleware');

// Protected routes (require admin authentication)
router.get('/dashboard', verifyToken, isAdmin, adminController.getDashboard);
router.get('/customer-analytics', verifyToken, isAdmin, adminController.getCustomerAnalytics);

module.exports = router;
