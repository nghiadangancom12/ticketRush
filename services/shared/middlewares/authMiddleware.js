const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const AppError = require('../errors/AppError');
const catchAsync = require('../errors/catchAsync');

/**
 * Stateless JWT Verification Middleware.
 *
 * ✅ Chỉ verify chữ ký JWT bằng JWT_SECRET — KHÔNG query database.
 * ✅ Gắn { id, role, iat, exp } vào req.user từ JWT payload.
 *
 * Trade-off chấp nhận được:
 *   - Không phát hiện được "tài khoản bị xóa" hoặc "mật khẩu vừa đổi" trong mỗi request.
 *   - Giải pháp: JWT expiry ngắn (15-30 phút) + Redis token blacklist khi cần invalidate ngay.
 *
 * Lợi ích:
 *   - Không phụ thuộc database-auth → các service khác độc lập thực sự.
 *   - Zero DB round-trip per request → giảm latency đáng kể.
 *   - Horizontal scaling không cần shared DB session.
 */
exports.verifyToken = catchAsync(async (req, res, next) => {
  let token;

  // 1. Lấy token từ Header hoặc Cookie
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('Bạn chưa đăng nhập! Vui lòng cung cấp token.', 401));
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('FATAL ERROR: JWT_SECRET is not defined.');
  }

  // 2. Verify chữ ký JWT — stateless, không cần DB
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3. Gắn thông tin user từ JWT payload vào request
  req.user = {
    id: decoded.id,
    role: decoded.role,
    iat: decoded.iat,
    exp: decoded.exp,
  };

  next();
});

exports.isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return next(new AppError('Yêu cầu quyền Admin!', 403));
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại!', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Bạn không có quyền thực hiện hành động này!', 403));
    }
    next();
  };
};
