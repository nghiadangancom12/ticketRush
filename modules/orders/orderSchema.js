const { z } = require('zod');

// ─── Regex helpers ────────────────────────────────────────────────────────────
// sort=field:asc,field2:desc — nhiều field phân cách bởi dấu phẩy
const SORT_REGEX = /^([a-zA-Z_]+:(asc|desc))(,[a-zA-Z_]+:(asc|desc))*$/;

// fields=id,email,full_name — chỉ chữ cái, số, gạch dưới, dấu phẩy
const FIELDS_REGEX = /^[a-zA-Z0-9_]+(,[a-zA-Z0-9_]+)*$/;
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Schema cho GET /api/orders
 * Validate toàn bộ query string của API getAllOrders.
 *
 * Lưu ý: validate.js parse({ query: req.query, ... })
 * nên schema bọc trong z.object({ query: ... })
 */
exports.getAllOrdersSchema = z.object({
  query: z.object({

    // ── eventId ──────────────────────────────────────────────────────────────
    eventId: z
      .string({ invalid_type_error: 'eventId phải là chuỗi' })
      .uuid('eventId phải là định dạng UUID hợp lệ (VD: a1b2c3d4-...)')
      .optional(),

    // ── user_id ───────────────────────────────────────────────────────────────
    user_id: z
      .string({ invalid_type_error: 'user_id phải là chuỗi' })
      .uuid('user_id phải là định dạng UUID hợp lệ (VD: a1b2c3d4-...)')
      .optional(),

    // ── status ────────────────────────────────────────────────────────────────
    status: z
      .enum(['PENDING', 'PAID', 'CANCELLED'], {
        errorMap: () => ({
          message: 'status chỉ được là PENDING, PAID hoặc CANCELLED',
        }),
      })
      .optional(),

    // ── created_at (object filter với gte/lte) ────────────────────────────────
    // URL: ?created_at[gte]=2025-01-01T00:00:00Z&created_at[lte]=2025-12-31T23:59:59Z
    // Express parse thành: { created_at: { gte: '2025-01-01T00:00:00Z', lte: '...' } }
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

    // ── sort ──────────────────────────────────────────────────────────────────
    sort: z
      .string()
      .max(100, 'sort không được vượt quá 100 ký tự')
      .regex(
        SORT_REGEX,
        'sort phải có định dạng field:asc hoặc field:desc, phân cách bằng dấu phẩy (VD: created_at:desc,total_amount:asc)'
      )
      .optional(),

    // ── fields ────────────────────────────────────────────────────────────────
    fields: z
      .string()
      .max(200, 'fields không được vượt quá 200 ký tự')
      .regex(
        FIELDS_REGEX,
        'fields chỉ được chứa chữ cái, số, gạch dưới và dấu phẩy (VD: id,status,total_amount)'
      )
      .optional(),

    // ── page ──────────────────────────────────────────────────────────────────
    // Tự động ép kiểu string → number (URL query params luôn là string)
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
