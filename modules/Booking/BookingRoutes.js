const express = require('express');
const router = express.Router();
const BookingController = require('./BookingController');
const { verifyToken } = require('../auth/auth.middleware');
const { verifyQueueAccess } = require('../queue/queueMiddleware');
const validate = require('../../utils/validate');
const { holdSeatsSchema, checkoutSchema } = require('./BookingSchema');

// --- ROUTES ---

// 1. API Giữ ghế
// Ở chế độ bình thường: Bảo vệ bởi Token và Virtual Queue
router.post('/hold', verifyToken, verifyQueueAccess, validate(holdSeatsSchema), BookingController.holdSeats);

// Ở chế độ TEST SẬP DB (Bỏ qua bảo vệ để stress test trực tiếp vào DB)
// router.post('/hold', validate(holdSeatsSchema), BookingController.holdSeats);

// 2. API Thanh toán
router.post('/checkout', verifyToken, verifyQueueAccess, validate(checkoutSchema), BookingController.checkout);

module.exports = router;
