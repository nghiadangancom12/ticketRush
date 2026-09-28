const { ZodError } = require('zod');
const AppError = require('../errors/AppError');

/**
 * Middleware validate dữ liệu bằng Zod kết hợp AppError.
 * @param {import('zod').AnyZodObject} schema
 */
const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const formattedErrors = err.issues.map((error) => ({
          field: error.path[error.path.length - 1],
          message: error.message,
        }));
        const validationError = new AppError('Dữ liệu đầu vào không hợp lệ!', 400);
        validationError.errors = formattedErrors;
        return next(validationError);
      }
      next(err);
    }
  };
};

module.exports = validate;
