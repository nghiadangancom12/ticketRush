const prisma = require('../../config/database');

// Include mặc định: trả về đầy đủ thông tin liên quan đến order
const DEFAULT_INCLUDE = {
  users: {
    select: {
      id: true,
      email: true,
      full_name: true,
    },
  },
  // 🌟 MỚI: Lấy trực tiếp sự kiện từ orders (Không cần chui qua tickets nữa)
  events: {
    select: {
      id: true,
      title: true,
      start_time: true,
      location: true,
    },
  },
  tickets: {
    include: {
      seats: {
        include: {
          zones: {
            select: {
              name: true, // Vẫn giữ lại tên Zone để biết vé thuộc khu nào (VD: VIP, Standard)
            },
          },
        },
      },
    },
  },
};

class OrderRepository {
  /**
   * Lấy danh sách orders với filter, sort, pagination từ PrismaApiFeatures.
   * Hỗ trợ lọc thêm theo eventId cực kỳ nhanh nhờ Denormalization.
   *
   * @param {object} prismaArgs  - { where, orderBy, select, skip, take }
   * @param {string} [eventId]   - Optional: lọc theo event cụ thể
   * @returns {{ data: Order[], total: number }}
   */
  async findAll(prismaArgs, eventId) {
    let where = prismaArgs.where || {};

    // 🌟 SỬA LẠI: Lọc trực tiếp bằng cột event_id siêu tốc độ (đã được đánh Index)
    if (eventId) {
      where = {
        ...where,
        event_id: eventId,
      };
    }

    const queryArgs = {
      ...prismaArgs,
      where,
      ...(prismaArgs.select
        ? { select: prismaArgs.select }
        : { include: DEFAULT_INCLUDE }),
    };

    const [data, total] = await Promise.all([
      prisma.orders.findMany(queryArgs),
      prisma.orders.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * Lấy chi tiết 1 order theo ID
   */
  async findById(id) {
    return prisma.orders.findUnique({
      where: { id },
      include: DEFAULT_INCLUDE,
    });
  }
}

module.exports = new OrderRepository();