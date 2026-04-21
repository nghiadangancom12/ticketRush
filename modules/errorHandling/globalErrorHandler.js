const AppError = require('./AppError');
const ResponseFactory = require('../../utils/ResponseFactory');

const handlePrismaDuplicateFieldsDB = err => {
  const value = err.meta && err.meta.target ? err.meta.target.join(', ') : 'unknown';
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handlePrismaInvalidIDDB = err => {
  const message = `Invalid ID format used in database query.`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);
const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = { ...err };
  error.message = err.message;
  error.name = err.name;
  error.code = err.code;

  if (error.code === 'P2002') error = handlePrismaDuplicateFieldsDB(error);
  if (error.code === 'P2023') error = handlePrismaInvalidIDDB(error); // UUID cast error sometimes
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    // Detailed error in development
    console.error('ERROR 💥', err);
    return res.status(error.statusCode).json({
      status: error.status,
      error: err,
      message: error.message,
      errors: error.errors, // <--- THÊM DÒNG NÀY: Lấy mảng lỗi chi tiết của Zod
      stack: err.stack
    });
  } else {
    // Production
    if (error.isOperational) {
      // <--- SỬA DÒNG NÀY: Truyền thêm error.errors làm tham số thứ 4
      return ResponseFactory.error(res, error.message, error.statusCode, error.errors); 
    }
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    return ResponseFactory.error(res, 'Something went very wrong!', 500);
  }
};
