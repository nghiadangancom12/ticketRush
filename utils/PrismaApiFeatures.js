
const RESERVED_PARAMS = new Set(['page', 'sort', 'limit', 'fields']);

// Các toán tử so sánh được phép
const ALLOWED_OPERATORS = new Set(['gte', 'gt', 'lte', 'lt', 'equals', 'not', 'contains', 'startsWith', 'endsWith']);

class PrismaApiFeatures {
  /**
   * @param {object} query - req.query từ Express
   */
  constructor(query) {
    this.query = query || {};
    this.prismaArgs = {};
  }

  filter() {
    const where = {};

    for (const [key, value] of Object.entries(this.query)) {
      // Bỏ qua các param đặc biệt
      if (RESERVED_PARAMS.has(key)) continue;

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Dạng: ?price[gte]=50 → query = { price: { gte: '50' } }
        const operatorMap = {};
        let hasValidOperator = false;

        for (const [op, opValue] of Object.entries(value)) {
          if (ALLOWED_OPERATORS.has(op)) {
            // Tự động ép kiểu số nếu giá trị là numeric string
            operatorMap[op] = isNaN(opValue) ? opValue : Number(opValue);
            hasValidOperator = true;
          }
        }

        if (hasValidOperator) {
          where[key] = operatorMap;
        }
      } else {
        // Dạng: ?status=PUBLISHED hoặc ?role=ADMIN
        // Nếu là mảng (do HPP whitelist), dùng toán tử { in: [...] }
        if (Array.isArray(value)) {
          where[key] = { in: value.map(v => {
            if (v === 'true') return true;
            if (v === 'false') return false;
            return isNaN(v) ? v : Number(v);
          }) };
        } else if (value === 'true') {
          where[key] = true;
        } else if (value === 'false') {
          where[key] = false;
        } else {
          where[key] = isNaN(value) ? value : Number(value);
        }
      }
    }

    this.prismaArgs.where = where;
    return this; // Fluent interface — cho phép chain
  }

  sort() {
    if (this.query.sort) {
      const sortStr = Array.isArray(this.query.sort) ? this.query.sort.join(',') : this.query.sort;
      const orderBy = sortStr
        .split(',')
        .map(item => {
          const [field, direction] = item.trim().split(':');
          const dir = (direction || 'asc').toLowerCase();
          // Chỉ chấp nhận 'asc' hoặc 'desc'
          return { [field.trim()]: dir === 'desc' ? 'desc' : 'asc' };
        });
      this.prismaArgs.orderBy = orderBy;
    } else {
      // Mặc định sắp xếp theo created_at giảm dần
      this.prismaArgs.orderBy = [{ created_at: 'desc' }];
    }

    return this;
  }

  limitFields() {
    if (this.query.fields) {
      const select = {};
      const fieldsStr = Array.isArray(this.query.fields) ? this.query.fields.join(',') : this.query.fields;
      fieldsStr
        .split(',')
        .map(f => f.trim())
        .filter(Boolean)
        .forEach(field => {
          select[field] = true;
        });
      this.prismaArgs.select = select;
    }
    // Nếu không có ?fields → không set select → Prisma trả về toàn bộ fields

    return this;
  }

  // ─────────────────────────────────────────────────────────
  // 4. PAGINATE
  // ?page=2&limit=10
  // → skip: 10, take: 10
  // Default: page=1, limit=100
  // ─────────────────────────────────────────────────────────
  paginate() {
    const page  = Math.max(1, parseInt(this.query.page,  10) || 1);
    const limit = Math.max(1, parseInt(this.query.limit, 10) || 100);

    this.prismaArgs.skip = (page - 1) * limit;
    this.prismaArgs.take = limit;

    // Giữ lại metadata để controller có thể trả về pagination info
    this._pagination = { page, limit };

    return this;
  }

  // ─────────────────────────────────────────────────────────
  // 5. GET ARGS — trả về Prisma args cuối cùng
  // ─────────────────────────────────────────────────────────
  getArgs() {
    return this.prismaArgs;
  }

  // Tiện ích: lấy thông tin phân trang (dùng trong response)
  getPagination() {
    return this._pagination || { page: 1, limit: 100 };
  }
}

module.exports = PrismaApiFeatures;
