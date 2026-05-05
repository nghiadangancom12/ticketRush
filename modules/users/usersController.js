const catchAsync = require('../errorHandling/catchAsync');
const AppError = require('../errorHandling/AppError');
const ResponseFactory = require('../../utils/ResponseFactory');
const userService = require('./userServices');
const imageHelper = require('../../utils/imageHelper');

/**
 * GET /api/users  (Admin only)
 * Hỗ trợ filter, sort, field selection và phân trang.
 * Ví dụ: GET /api/users?role=CUSTOMER&sort=created_at:desc&fields=id,email,role&page=1&limit=20
 */
exports.getAllUsers = catchAsync(async (req, res) => {
  const result = await userService.getAllUsers(req.query);
  ResponseFactory.success(res, result, 'Lấy danh sách người dùng thành công');
});

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

/**
 * DELETE /users/:userId  (Admin only)
 * Soft-delete: không xóa thật, chỉ set deleted_at = now()
 */
exports.deleteUser = catchAsync(async (req, res) => {
  const { userId } = req.params;
  await userService.deleteUser(userId);
  // 204 No Content — chuẩn REST cho DELETE thành công
  res.status(204).send();
});

/**
 * PATCH /users/me/avatar  (Authenticated user)
 * Upload + cập nhật avatar của user đang đăng nhập.
 * Yêu cầu: multipart/form-data với field name "image"
 */
exports.updateAvatar = catchAsync(async (req, res) => {
  // 1. Kiểm tra file ảnh có được gửi lên không
  if (!req.file) {
    throw new AppError('Vui lòng gửi kèm file ảnh!', 400);
  }

  // 2. Lấy avatar cũ để xóa sau khi upload thành công
  const currentUser = await userService.getProfile(req.user.id);
  const oldAvatarUrl = currentUser.avatar_url;

  // 3. Xử lý + lưu avatar mới (Sharp resize về 400x400, convert sang WebP)
  const newAvatarUrl = await imageHelper.saveImage(req.file.buffer, 'avatars');

  // 4. Cập nhật đường dẫn avatar mới vào Database
  const updatedUser = await userService.updateProfile(req.user.id, { avatar_url: newAvatarUrl });

  // 5. Xóa avatar cũ sau khi DB đã được cập nhật thành công
  imageHelper.deleteImage(oldAvatarUrl);

  ResponseFactory.success(res, updatedUser, 'Ảnh đại diện đã được cập nhật!');
});

module.exports = exports;


