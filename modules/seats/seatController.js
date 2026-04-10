const catchAsync = require('../errorHandling/catchAsync');
const ResponseFactory = require('../../utils/ResponseFactory');
const bookingFacade = require('./BookingFacade');

exports.holdSeats = catchAsync(async (req, res) => {
  const { seatIds, eventId } = req.body;
  const lockedIds = await bookingFacade.holdSeats(req.user.id, eventId, seatIds);
  const io = req.app.get('io');
  if (io) io.emit('seatUpdated', { lockedSeats: lockedIds });
  ResponseFactory.success(res, { lockedIds }, 'Seats locked successfully');
});

exports.checkout = catchAsync(async (req, res) => {
  const { eventId } = req.body;
  const result = await bookingFacade.checkout(req.user.id, eventId);
  const io = req.app.get('io');
  if (io) io.emit('seatUpdated', { soldSeats: result.seats });
  ResponseFactory.success(res, { order: result.order }, 'Checkout successful');
});
