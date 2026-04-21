const { z } = require('zod');

// Schema cho API Cập nhật thông tin cá nhân (PATCH /me)
exports.updateProfileSchema = z.object({
  body: z.object({
    full_name: z
      .string()
      .min(2, 'Họ tên phải có ít nhất 2 ký tự!')
      .max(100, 'Họ tên không được vượt quá 100 ký tự!')
      .optional(), // Dùng .optional() vì đây là PATCH, user có thể không gửi trường này

    avatar_url: z
      .string()
      // .url('Định dạng link ảnh không hợp lệ!') // Bỏ comment dòng này nếu bạn muốn ép user phải gửi link có http:// hoặc https://
      .optional(),

    gender: z
      .enum(['MALE', 'FEMALE', 'OTHER'], {
        errorMap: () => ({ message: 'Giới tính chỉ được là MALE, FEMALE hoặc OTHER' })
      })
      .optional(),

    date_of_birth: z
      .string()
      // Bắt buộc Frontend phải gửi đúng chuẩn YYYY-MM-DD
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày sinh phải có định dạng YYYY-MM-DD (VD: 2005-04-21)')
      .or(z.literal('')) // QUAN TRỌNG: Cho phép gửi chuỗi rỗng "" để khớp với logic XÓA ngày sinh trong Service
      .optional()
  })
});