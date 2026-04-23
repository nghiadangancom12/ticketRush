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
 verifyToken, verifyQueueAccess,validate(holdSeatsSchema),
  BookingController.holdSeats
);

// 2. API Thanh toán
router.post('/checkout', verifyToken, verifyQueueAccess, validate(checkoutSchema), BookingController.checkout);

// 3. API Trả ghế (Hủy giữ chỗ + Giải phóng queue slot cho người tiếp theo)
router.post('/return', verifyToken, BookingController.returnSeats);

// 3. API TEST: Dành riêng cho kịch bản bullmq-stress-test.yml (Bỏ qua DB, nhồi thẳng vào Queue)
router.post('/test-email-stress', async (req, res, next) => {
  try {
    const { emailQueue } = require('../jobs/queues');
    
    // 1. Hứng dữ liệu từ kịch bản Artillery (hoặc Postman)
    // Nếu không có, dự phòng bằng dữ liệu ngẫu nhiên để không bị sập
    const email = req.body.email || `khachhang_${Math.floor(Math.random() * 1000)}@gmail.com`;
    const orderId = req.body.orderId || ('TEST-ORDER-' + Math.floor(Math.random() * 1000000));
    
    // 2. Nhồi đầy đủ cả orderId và email vào Queue
    await emailQueue.add('send-ticket-email', {
      orderId: orderId,
      email: email // THÊM DÒNG NÀY LÀ CỰC KỲ QUAN TRỌNG
    }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 }
    });

    res.status(201).json({ 
      status: 'success', 
      message: `Đã nhồi job gửi email cho ${email} (Order: ${orderId}).` 
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
