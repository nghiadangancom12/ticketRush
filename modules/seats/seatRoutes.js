const express = require('express');
const router = express.Router();
const seatController = require('./seatController');
const { verifyToken } = require('../auth/auth.middleware');

router.post('/hold', verifyToken, seatController.holdSeats);
router.post('/checkout', verifyToken, seatController.checkout);

module.exports = router;
