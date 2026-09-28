const catchAsync = require('../../../shared/errors/catchAsync');
const ResponseFactory = require('../../../shared/utils/ResponseFactory');
const customerService = require('./customerService');

exports.getProfile = catchAsync(async (req, res) => {
  const authHeader = req.headers.authorization;
  const [profile, orders, lockedSeats] = await Promise.all([
    customerService.getProfile(req.user.id),
    customerService.getOrderHistory(req.user.id, authHeader),
    customerService.getLockedSeats(req.user.id, authHeader),
  ]);
  ResponseFactory.success(res, { profile, orders, lockedSeats });
});

exports.updateProfile = catchAsync(async (req, res) => {
  const updated = await customerService.updateProfile(req.user.id, req.body);
  ResponseFactory.success(res, updated, 'Profile updated successfully');
});

exports.getPurchaseHistory = catchAsync(async (req, res) => {
  const authHeader = req.headers.authorization;
  const [orders, lockedSeats] = await Promise.all([
    customerService.getOrderHistory(req.user.id, authHeader),
    customerService.getLockedSeats(req.user.id, authHeader),
  ]);
  ResponseFactory.success(res, { orders, lockedSeats });
});
