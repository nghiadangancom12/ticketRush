const express = require('express');
const router = express.Router();
const seatController = require('./BookingController');
const { verifyToken } = require('../auth/auth.middleware');

router.post('/hold', verifyToken, seatController.holdSeats);
router.post('/checkout', verifyToken, seatController.checkout);

module.exports = router;
