const catchAsync = require('../errorHandling/catchAsync');
const ResponseFactory = require('../../utils/ResponseFactory');
const customerService = require('./customerService');

exports.getProfile = catchAsync(async (req, res) => {
  const [profile, orders, lockedSeats] = await Promise.all([
    customerService.getProfile(req.userId),
    customerService.getOrderHistory(req.userId),
    customerService.getLockedSeats(req.userId)
  ]);
  ResponseFactory.success(res, { profile, orders, lockedSeats });
});

exports.updateProfile = catchAsync(async (req, res) => {
  const updated = await customerService.updateProfile(req.userId, req.body);
  ResponseFactory.success(res, updated, 'Profile updated successfully');
});

exports.getPurchaseHistory = catchAsync(async (req, res) => {
  const [orders, lockedSeats] = await Promise.all([
    customerService.getOrderHistory(req.userId)
  ]);
  ResponseFactory.success(res, { orders, lockedSeats });
});


