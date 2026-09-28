const AppError = require('../errors/AppError');
const ResponseFactory = require('../utils/ResponseFactory');

const handlePrismaDuplicateFieldsDB = err => {
  const value = err.meta && err.meta.target ? err.meta.target.join(', ') : 'unknown';
  return new AppError(`Duplicate field value: ${value}. Please use another value!`, 400);
};

const handlePrismaInvalidIDDB = () =>
  new AppError('Invalid ID format used in database query.', 400);

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
  if (error.code === 'P2023') error = handlePrismaInvalidIDDB();
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    console.error('ERROR 💥', err);
    return res.status(error.statusCode).json({
      status: error.status,
      error: err,
      message: error.message,
      errors: error.errors,
      stack: err.stack
    });
  } else {
    if (error.isOperational) {
      return ResponseFactory.error(res, error.message, error.statusCode, error.errors);
    }
    console.error('ERROR 💥', err);
    return ResponseFactory.error(res, 'Something went very wrong!', 500);
  }
};
