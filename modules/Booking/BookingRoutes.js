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

// 4. API Lấy danh sách vé đã mua của user (phục vụ API composition từ User Service, chống IDOR)
router.get('/my-tickets', verifyToken, BookingController.getMyTickets);

// 5. CQRS Query Side: API Đọc sơ đồ ghế từ Redis Read Model
router.get('/event/:eventId/seats', BookingController.getSeatMap);

// 6. API Composition endpoints cho User Service
router.get('/purchase-history', verifyToken, BookingController.getPurchaseHistory);
router.get('/locked-seats', verifyToken, BookingController.getLockedSeats);

// 7. Internal Provisioning endpoint từ Event Catalog Service
router.post('/internal/provision-seats', BookingController.provisionSeats);

module.exports = router;
