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
//router.post('/hold', verifyToken, verifyQueueAccess, validate(holdSeatsSchema), BookingController.holdSeats);

// Ở chế độ TEST SẬP DB (Bỏ qua bảo vệ để stress test trực tiếp vào DB)
 // Ở chế độ TEST SẬP DB (Bỏ qua bảo vệ để stress test trực tiếp vào DB)
router.post('/hold', 
  // 1. Validate body (Nghĩa nhớ kiểm tra xem holdSeatsSchema có cho phép truyền userId trong body không nhé)
  validate(holdSeatsSchema), 
  
  // 2. MIDDLEWARE GIẢ LẬP (Fake Auth)
  (req, res, next) => {
    // Tự động tạo req.user lấy ID từ cục JSON của Artillery bắn lên
    req.user = { 
      id: req.body.userId 
    };
    next();
  },
  
  // 3. Controller xử lý
  BookingController.holdSeats
);

// 2. API Thanh toán
router.post('/checkout', verifyToken, verifyQueueAccess, validate(checkoutSchema), BookingController.checkout);

module.exports = router;
