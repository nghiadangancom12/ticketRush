const catchAsync = require('../errorHandling/catchAsync');
const ResponseFactory = require('../../utils/ResponseFactory');
const bookingService = require('./BookingService');
const bookingRepo = require('./BookingRepository');
const redisPublisher = require('../../config/redisPublisher');

const publishSeatStatus = async (eventId, seats, status) => {
  if (!seats || seats.length === 0) return;
  const payload = { eventId, seats, status };
  try {
    await redisPublisher.publish('seatStatusChanged', JSON.stringify(payload));
  } catch (err) {
    console.error('[BookingController] ❌ Lỗi publish seatStatusChanged:', err.message);
  }
};

exports.holdSeats = catchAsync(async (req, res) => {
  const { seatIds, eventId } = req.body;
  const lockedIds = await bookingService.holdSeats(req.user.id, eventId, seatIds);

  // Lên lịch nhả ghế tự động sau 60 giây nếu chưa thanh toán
  await bookingService.scheduleRelease(req.user.id, eventId, lockedIds);

  await publishSeatStatus(eventId, lockedIds, 'LOCKED');

  const io = req.app.get('io');
  if (io) {
    io.to(`event_${eventId}`).emit('seatStatusChanged', {
      eventId,
      seats: lockedIds,
      status: 'LOCKED'
    });
  }

  ResponseFactory.success(res, { lockedIds }, 'Giữ ghế thành công');
});

exports.checkout = catchAsync(async (req, res) => {
  const { eventId } = req.body;
  const userEmail = req.user?.email || '';
  const result = await bookingService.checkout(req.user.id, eventId, userEmail);

  await publishSeatStatus(eventId, result.seats, 'SOLD');

  const io = req.app.get('io');
  if (io) {
    io.to(`event_${eventId}`).emit('seatStatusChanged', {
      eventId,
      seats: result.seats,
      status: 'SOLD'
    });
  }

  ResponseFactory.success(res, { order: result.order }, 'Thanh toán thành công');
});

/**
 * POST /api/Booking/return
 * Trả toàn bộ ghế đang LOCKED về AVAILABLE + giải phóng slot queue.
 */
exports.returnSeats = catchAsync(async (req, res) => {
  const { eventId } = req.body;
  const result = await bookingService.returnSeats(req.user.id, eventId);

  if (result.releasedIds.length > 0) {
    await publishSeatStatus(eventId, result.releasedIds, 'AVAILABLE');
  }

  const io = req.app.get('io');
  if (io && result.releasedIds.length > 0) {
    io.to(`event_${eventId}`).emit('seatStatusChanged', {
      eventId,
      seats: result.releasedIds,
      status: 'AVAILABLE'
    });
  }

  ResponseFactory.success(
    res,
    { releasedCount: result.releasedIds.length },
    result.releasedIds.length > 0
      ? `Đã trả ${result.releasedIds.length} ghế thành công.`
      : 'Không có ghế nào đang giữ để trả.'
  );
});

/**
 * GET /api/booking/my-tickets
 * Lấy danh sách vé đã mua của user đang đăng nhập (chống IDOR).
 */
exports.getMyTickets = catchAsync(async (req, res) => {
  const tickets = await bookingService.getUserTickets(req.user.id);
  ResponseFactory.success(res, tickets, 'Lấy danh sách vé thành công');
});

/**
 * GET /api/booking/event/:eventId/seats
 * CQRS Query Side: Đọc sơ đồ ghế từ Redis Read Model.
 */
exports.getSeatMap = catchAsync(async (req, res) => {
  const { eventId } = req.params;
  const seatMap = await bookingService.getSeatMap(eventId);
  ResponseFactory.success(res, seatMap, 'Lấy sơ đồ ghế thành công');
});

/**
 * GET /api/booking/purchase-history
 * API Composition endpoint cho User Service / Customer Controller.
 */
exports.getPurchaseHistory = catchAsync(async (req, res) => {
  const orders = await bookingRepo.getPurchaseHistory(req.user.id);
  ResponseFactory.success(res, orders, 'Lấy lịch sử mua hàng thành công');
});

/**
 * GET /api/booking/locked-seats
 * API Composition endpoint cho User Service / Customer Controller.
 */
exports.getLockedSeats = catchAsync(async (req, res) => {
  const seats = await bookingRepo.getLockedSeatsByUser(req.user.id);
  ResponseFactory.success(res, seats, 'Lấy ghế đang giữ thành công');
});

/**
 * POST /api/booking/internal/provision-seats
 * Internal API được gọi từ Event Catalog Service khi tạo event mới.
 */
exports.provisionSeats = catchAsync(async (req, res) => {
  const { seats } = req.body;
  if (!seats || !Array.isArray(seats)) {
    return ResponseFactory.success(res, { count: 0 }, 'Không có ghế cần tạo');
  }
  const result = await bookingRepo.createManySeats(seats);
  ResponseFactory.success(res, result, 'Khởi tạo ghế thành công');
});