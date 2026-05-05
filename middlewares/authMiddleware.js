const jwt = require('jsonwebtoken');
const AppError = require('../modules/errorHandling/AppError');
const catchAsync = require('../modules/errorHandling/catchAsync');
const authRepository = require('../modules/auth/authRepository');
const { promisify } = require('util');
exports.verifyToken = catchAsync(async (req, res, next) => {
  let token;

  // 1. Kiểm tra token trong Header (Dùng cho Mobile/Postman)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 2. Kiểm tra token trong Cookie (Dùng cho Web Browser)
  else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('Bạn chưa đăng nhập! Vui lòng cung cấp token.', 401));
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('FATAL ERROR: JWT_SECRET is not defined.');
  }

  // 3. Giải mã token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 4. Kiểm tra User có còn tồn tại không
  const currentUser = await authRepository.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('Tài khoản thuộc về token này không còn tồn tại.', 401));
  }

  // 5. Kiểm tra mật khẩu có bị đổi sau khi token được cấp không
  if (currentUser.password_changed_at) {
    const changedTimestamp = parseInt(currentUser.password_changed_at.getTime() / 1000, 10);

    if (decoded.iat < changedTimestamp) {
      return next(new AppError('Mật khẩu của bạn đã được thay đổi gần đây! Vui lòng đăng nhập lại.', 401));
    }
  }

  // 6. Cấp quyền
  req.user = currentUser;
  next();
});

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return next(new AppError('Yêu cầu quyền Admin!', 403));
  }
  next();
};
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // 1. Kiểm tra xem user có tồn tại không (đề phòng verifyToken bị lỗi)
    if (!req.user) {
      return next(new AppError('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại!', 401));
    }

    // 2. Kiểm tra quyền
    // Biến 'roles' sẽ là một mảng chứa các quyền được truyền vào. VD: ['ADMIN', 'MANAGER']
    // Nếu role của user hiện tại không nằm trong mảng này -> Chặn!
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Bạn không có quyền thực hiện hành động này!', 403));
    }

    // 3. Hợp lệ -> Cho phép đi tiếp vào Controller
    next();
  };
};
