const { z } = require('zod');

// ─── Regex helpers ────────────────────────────────────────────────────────────
const SORT_REGEX   = /^([a-zA-Z_]+:(asc|desc))(,[a-zA-Z_]+:(asc|desc))*$/;
const FIELDS_REGEX = /^[a-zA-Z0-9_]+(,[a-zA-Z0-9_]+)*$/;
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Schema cho API Lấy danh sách người dùng (GET /api/users) — Admin only
// ─────────────────────────────────────────────────────────────────────────────
exports.getAllUserSchema = z.object({
  query: z.object({

    // ── role ─────────────────────────────────────────────────────────────────
    role: z
      .enum(['ADMIN', 'CUSTOMER'], {
        errorMap: () => ({ message: 'role chỉ được là ADMIN hoặc CUSTOMER' }),
      })
      .optional(),

    // ── gender ───────────────────────────────────────────────────────────────
    gender: z
      .enum(['MALE', 'FEMALE', 'OTHER'], {
        errorMap: () => ({ message: 'gender chỉ được là MALE, FEMALE hoặc OTHER' }),
      })
      .optional(),

    // ── created_at (lọc theo khoảng thời gian) ───────────────────────────────
    // URL: ?created_at[gte]=2025-01-01T00:00:00Z&created_at[lte]=2025-12-31T23:59:59Z
    // Express tự parse thành: { created_at: { gte: '...', lte: '...' } }
    created_at: z
      .object({
        gte: z
          .string()
          .datetime({ message: 'created_at[gte] phải là chuẩn ISO 8601 (VD: 2025-01-01T00:00:00Z)' })
          .optional(),
        lte: z
          .string()
          .datetime({ message: 'created_at[lte] phải là chuẩn ISO 8601 (VD: 2025-12-31T23:59:59Z)' })
          .optional(),
      })
      .optional(),

    // ── sort ─────────────────────────────────────────────────────────────────
    sort: z
      .string()
      .max(100, 'sort không được vượt quá 100 ký tự')
      .regex(
        SORT_REGEX,
        'sort phải có định dạng field:asc hoặc field:desc, phân cách bằng dấu phẩy (VD: created_at:desc,role:asc)'
      )
      .optional(),

    // ── fields ────────────────────────────────────────────────────────────────
    fields: z
      .string()
      .max(200, 'fields không được vượt quá 200 ký tự')
      .regex(
        FIELDS_REGEX,
        'fields chỉ được chứa chữ cái, số, gạch dưới và dấu phẩy (VD: id,email,full_name,role)'
      )
      .optional(),

    // ── page ─────────────────────────────────────────────────────────────────
    page: z
      .string()
      .optional()
      .transform((val) => (val !== undefined ? parseInt(val, 10) : 1))
      .pipe(
        z
          .number({ invalid_type_error: 'page phải là số nguyên' })
          .int('page phải là số nguyên')
          .min(1, 'page tối thiểu là 1')
          .max(10000, 'page tối đa là 10000 (chống OFFSET quá lớn)')
      ),

    // ── limit ─────────────────────────────────────────────────────────────────
    limit: z
      .string()
      .optional()
      .transform((val) => (val !== undefined ? parseInt(val, 10) : 100))
      .pipe(
        z
          .number({ invalid_type_error: 'limit phải là số nguyên' })
          .int('limit phải là số nguyên')
          .min(1, 'limit tối thiểu là 1')
          .max(100, 'limit tối đa là 100')
      ),
  }),
});