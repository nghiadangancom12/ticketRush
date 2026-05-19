const express = require('express');
const router = express.Router();
const BookingController = require('./BookingController');
const { verifyToken } = require('../../middlewares/authMiddleware');
const { verifyQueueAccess } = require('../../middlewares/queueMiddleware');
const validate = require('../../utils/validate');
const { holdSeatsSchema, checkoutSchema } = require('./BookingSchema');

// --- ROUTES ---

router.post('/hold',
  verifyToken, verifyQueueAccess, validate(holdSeatsSchema),
  BookingController.holdSeats
);

// 2. API Thanh toán
router.post('/checkout', verifyToken, verifyQueueAccess, validate(checkoutSchema), BookingController.checkout);

// 3. API Trả ghế (Hủy giữ chỗ + Giải phóng queue slot cho người tiếp theo)
router.post('/return', verifyToken, BookingController.returnSeats);


module.exports = router;
