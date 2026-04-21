const catchAsync = require('../errorHandling/catchAsync');
const ResponseFactory = require('../../utils/ResponseFactory');
const bookingService = require('./BookingService');

exports.holdSeats = catchAsync(async (req, res) => {
  const { seatIds, eventId } = req.body;
  const lockedIds = await bookingService.holdSeats(req.user.id, eventId, seatIds);
  
  const io = req.app.get('io');
  if (io) {
    // Chỉ bắn thông báo cho những ai đang ở trong "phòng" của event này
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
    // Chỉ bắn thông báo cho những ai đang ở trong "phòng" của event này
    io.to(`event_${eventId}`).emit('seatStatusChanged', { 
      eventId, 
      seats: result.seats, 
      status: 'SOLD' 
    });
  }
  
  ResponseFactory.success(res, { order: result.order }, 'Thanh toán thành công');
});
