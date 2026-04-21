const catchAsync = require('../errorHandling/catchAsync');
const ResponseFactory = require('../../utils/ResponseFactory');
const userService = require('./userServices');


// Admin cấp quyền admin cho user khác
exports.grantAdminRole = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const updated = await userService.updateRole(userId, 'ADMIN');
  ResponseFactory.success(res, updated, 'Admin role granted successfully');
});

// Admin hủy quyền admin của user (downgrade về CUSTOMER)
exports.revokeAdminRole = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const updated = await userService.updateRole(userId, 'CUSTOMER');
  ResponseFactory.success(res, updated, 'Admin role revoked successfully');
});
exports.getMe = catchAsync(async (req, res) => {
  const user = await userService.getProfile(req.user.id);
  ResponseFactory.success(res, user);
}); 
exports.updateProfile = catchAsync(async (req, res) => {
  const updated = await userService.updateProfile(req.user.id, req.body);
  ResponseFactory.success(res, updated, 'Profile updated successfully');
});
module.exports = exports;
