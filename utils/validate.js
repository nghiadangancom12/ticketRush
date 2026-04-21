const { ZodError } = require('zod');
// Thay đổi đường dẫn này cho đúng với thư mục chứa AppError của bạn nhé
const AppError = require('../modules/errorHandling/AppError'); 

/**
 * Middleware dùng chung để validate dữ liệu bằng Zod kết hợp AppError
 * @param {import('zod').AnyZodObject} schema - Schema của Zod
 */
const validate = (schema) => {
  return (req, res, next) => {
    try {
      // 1. Kiểm tra dữ liệu
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // 2. Dữ liệu hợp lệ -> Đi tiếp
      next();
    } catch (err) {
      // 3. Nếu là lỗi do Zod (Sai định dạng dữ liệu)
      if (err instanceof ZodError) {
        // Format lại cục lỗi của Zod (sử dụng issues thay vì errors để tránh undefined)
        const formattedErrors = err.issues.map((error) => ({
          field: error.path[error.path.length - 1], 
          message: error.message,
        }));

        // Khởi tạo AppError với message chung và mã 400
        const validationError = new AppError('Dữ liệu đầu vào không hợp lệ!', 400);
        
        // ✨ ĐIỂM QUAN TRỌNG: Gắn mảng lỗi chi tiết vào object AppError
        validationError.errors = formattedErrors;

        // Ném lỗi về cho Global Error Handler xử lý
        return next(validationError);
      }

      // 4. Nếu là lỗi hệ thống khác không phải do Zod
      next(err);
    }
  };
};

module.exports = validate;