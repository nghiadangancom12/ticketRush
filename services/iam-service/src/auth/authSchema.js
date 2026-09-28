const { z } = require('zod');

// 1. Schema cho API Đăng ký (Register)
exports.registerSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Vui lòng nhập email!' })
      .email('Định dạng email không hợp lệ!'),
    
    password: z
      .string({ required_error: 'Vui lòng nhập mật khẩu!' })
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự!')
      .max(255, 'Mật khẩu không được vượt quá 255 ký tự!'),
    
    full_name: z
      .string({ required_error: 'Vui lòng nhập họ tên!' })
      .min(2, 'Họ tên phải có ít nhất 2 ký tự!')
      .max(100, 'Họ tên không được vượt quá 100 ký tự!'),
    
    // Các trường không bắt buộc (optional)
    date_of_birth: z
      .string()
      // Kiểm tra định dạng YYYY-MM-DD cơ bản
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày sinh phải có định dạng YYYY-MM-DD') 
      .optional(),
    
    gender: z
      .enum(['MALE', 'FEMALE', 'OTHER'], {
        errorMap: () => ({ message: 'Giới tính chỉ được là MALE, FEMALE hoặc OTHER' })
      })
      .optional()
  })
});

// 2. Schema cho API Đăng nhập (Login)
exports.loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Vui lòng nhập email!' })
      .email('Định dạng email không hợp lệ!'),
    
    password: z
      .string({ required_error: 'Vui lòng nhập mật khẩu!' })
      .min(1, 'Vui lòng nhập mật khẩu!') // Lúc login chỉ cần check xem user có nhập gì không
  })
});

// 3. Schema cho Quên mật khẩu (Forgot Password)
exports.forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Vui lòng nhập email!' })
      .email('Định dạng email không hợp lệ!')
  })
});

// 4. Schema cho Cấp lại mật khẩu (Reset Password)
exports.resetPasswordSchema = z.object({
  body: z
    .object({
      password: z
        .string({ required_error: 'Vui lòng nhập mật khẩu mới!' })
        .min(6, 'Mật khẩu phải có ít nhất 6 ký tự!'),
      passwordConfirm: z.string({ required_error: 'Vui lòng nhập lại mật khẩu!' })
    })
    .refine((data) => data.password === data.passwordConfirm, {
      message: 'Mật khẩu xác nhận không khớp!',
      path: ['passwordConfirm']
    })
});