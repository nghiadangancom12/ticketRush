const jwt = require('jsonwebtoken');
const AppError = require('../errorHandling/AppError');
const catchAsync = require('../errorHandling/catchAsync');
const authRepository = require('./authRepository');
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

  // 5. Cấp quyền
  req.user = currentUser;
  next();
});

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return next(new AppError('Yêu cầu quyền Admin!', 403));
  }
  next();
};
