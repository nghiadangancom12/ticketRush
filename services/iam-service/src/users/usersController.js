const catchAsync = require('../../../shared/errors/catchAsync');
const AppError = require('../../../shared/errors/AppError');
const ResponseFactory = require('../../../shared/utils/ResponseFactory');
const userService = require('./usersService');
const imageHelper = require('../../../shared/utils/imageHelper');

exports.getAllUsers = catchAsync(async (req, res) => {
  const result = await userService.getAllUsers(req.query);
  ResponseFactory.success(res, result, 'Lấy danh sách người dùng thành công');
});

exports.grantAdminRole = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const updated = await userService.updateRole(userId, 'ADMIN');
  ResponseFactory.success(res, updated, 'Admin role granted successfully');
});

exports.revokeAdminRole = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const updated = await userService.updateRole(userId, 'CUSTOMER');
  ResponseFactory.success(res, updated, 'Admin role revoked successfully');
});

exports.getMe = catchAsync(async (req, res) => {
  const user = await userService.getProfile(req.user.id);
  ResponseFactory.success(res, user);
});

exports.getMyTickets = catchAsync(async (req, res) => {
  const authHeader = req.headers.authorization;
  const tickets = await userService.getMyTickets(req.user.id, authHeader);
  ResponseFactory.success(res, tickets, 'Lấy danh sách vé thành công');
});

exports.updateProfile = catchAsync(async (req, res) => {
  const updated = await userService.updateProfile(req.user.id, req.body);
  ResponseFactory.success(res, updated, 'Profile updated successfully');
});

exports.deleteUser = catchAsync(async (req, res) => {
  const { userId } = req.params;
  await userService.deleteUser(userId);
  res.status(204).send();
});

exports.updateAvatar = catchAsync(async (req, res) => {
  if (!req.file) throw new AppError('Vui lòng gửi kèm file ảnh!', 400);
  const currentUser = await userService.getProfile(req.user.id);
  const oldAvatarUrl = currentUser.avatar_url;
  const newAvatarUrl = await imageHelper.saveImage(req.file.buffer, 'avatars');
  const updatedUser = await userService.updateProfile(req.user.id, { avatar_url: newAvatarUrl });
  imageHelper.deleteImage(oldAvatarUrl);
  ResponseFactory.success(res, updatedUser, 'Ảnh đại diện đã được cập nhật!');
});

exports.updatePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await userService.updatePassword(req.user.id, currentPassword, newPassword);
  ResponseFactory.success(res, null, 'Cập nhật mật khẩu thành công');
});

module.exports = exports;
