const catchAsync = require('../errorHandling/catchAsync');
const ResponseFactory = require('../../utils/ResponseFactory');
const customerService = require('./CustomerService');

exports.getProfile = catchAsync(async (req, res) => {
  const [profile, orders, lockedSeats] = await Promise.all([
    customerService.getProfile(req.user.id),
    customerService.getOrderHistory(req.user.id),
    customerService.getLockedSeats(req.user.id)
  ]);
  ResponseFactory.success(res, { profile, orders, lockedSeats });
});

exports.updateProfile = catchAsync(async (req, res) => {
  const updated = await customerService.updateProfile(req.user.id, req.body);
  ResponseFactory.success(res, updated, 'Profile updated successfully');
});

exports.getPurchaseHistory = catchAsync(async (req, res) => {
  const [orders, lockedSeats] = await Promise.all([
    customerService.getOrderHistory(req.user.id),
    customerService.getLockedSeats(req.user.id)
  ]);
  ResponseFactory.success(res, { orders, lockedSeats });
});
