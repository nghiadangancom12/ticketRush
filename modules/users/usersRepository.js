const prisma = require('../../config/database');

class UserRepository {
  async findById(id) {
    return prisma.users.findUnique({ where: { id } });
  }

  async findByEmail(email) {
    return prisma.users.findUnique({ where: { email } });
  }

  async create(data) {
    return prisma.users.create({ data });
  }

  async update(id, data) {
    return prisma.users.update({
      where: { id },
      data
    });
  }

  async findMany(where, orderBy) {
    return prisma.users.findMany({
      where,
      orderBy
    });
  }

  /**
   * Truy vấn linh hoạt, nhận toàn bộ prismaArgs từ PrismaApiFeatures
   * (where, orderBy, select, skip, take)
   */
  async findAll(prismaArgs) {
    const [data, total] = await Promise.all([
      prisma.users.findMany(prismaArgs),
      prisma.users.count({ where: prismaArgs.where }),
    ]);
    return { data, total };
  }

  async getUserTickets(userId) {
    const tickets = await prisma.tickets.findMany({
      where: {
        orders: {
          user_id: userId,
          status: 'PAID'
        }
      },
      select: {
        id: true,
        qr_code: true,
        status: true,
        seats: {
          select: {
            seat_number: true,
            row_label: true,
            zones: {
              select: {
                events: {
                  select: {
                    id: true,
                    title: true,
                    start_time: true,
                    location: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        issued_at: 'desc'
      }
    });

    return tickets.map(t => ({
      id: t.id,
      qr_code: t.qr_code,
      status: t.status,
      seat_number: t.seats.seat_number,
      row_label: t.seats.row_label,
      event: {
        id: t.seats.zones.events.id,
        title: t.seats.zones.events.title,
        start_time: t.seats.zones.events.start_time,
        location: t.seats.zones.events.location
      }
    }));
  }

  /**
   * Soft Delete: Đánh dấu user đã bị xóa bằng cách set deleted_at = now()
   * Không xóa dữ liệu thật sự khỏi database.
   */
  async softDelete(id) {
    return prisma.users.update({
      where: { id },
      data: { deleted_at: new Date() }
    });
  }
}

module.exports = new UserRepository();

