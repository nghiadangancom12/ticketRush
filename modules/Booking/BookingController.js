const catchAsync = require('../errorHandling/catchAsync');
const ResponseFactory = require('../../utils/ResponseFactory');
const bookingService = require('./BookingService');

exports.holdSeats = catchAsync(async (req, res) => {
  const { seatIds, eventId } = req.body;
  const lockedIds = await bookingService.holdSeats(req.user.id, eventId, seatIds);

  // Lên lịch nhả ghế tự động sau 60 giây nếu chưa thanh toán
  // Tách ra khỏi transaction để job chỉ được đăng ký khi DB đã commit thành công
  await bookingService.scheduleRelease(req.user.id, eventId, lockedIds);

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
  const result = await bookingService.checkout(req.user.id, eventId);

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
 * Gọi khi user bấm Hủy / Quay Lại trên trang Checkout.
 */
exports.returnSeats = catchAsync(async (req, res) => {
  const { eventId } = req.body;
  const result = await bookingService.returnSeats(req.user.id, eventId);

  // Báo hiệu real-time: các ghế này đã về AVAILABLE
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
