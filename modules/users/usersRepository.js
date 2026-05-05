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

