const prisma = require('../../config/database-booking');

// Include mặc định trong booking_db: trả về tickets và seats (đã có snapshot zone_name, zone_price)
const DEFAULT_INCLUDE = {
  tickets: {
    include: {
      seats: {
        select: {
          id: true,
          seat_number: true,
          row_label: true,
          zone_name: true,
          zone_price: true
        }
      }
    }
  }
};

class OrderRepository {
  /**
   * Lấy danh sách orders với filter, sort, pagination từ PrismaApiFeatures.
   */
  async findAll(prismaArgs, eventId) {
    let where = prismaArgs.where || {};

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