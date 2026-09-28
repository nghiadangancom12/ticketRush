// IAM Service — User Repository (auth_db)
const prisma = require('../../config/database-auth');
const PrismaApiFeatures = require('../../../shared/utils/PrismaApiFeatures');

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
    return prisma.users.update({ where: { id }, data });
  }

  async findMany(where, orderBy) {
    return prisma.users.findMany({ where, orderBy });
  }

  async findAll(prismaArgs) {
    const [data, total] = await Promise.all([
      prisma.users.findMany(prismaArgs),
      prisma.users.count({ where: prismaArgs.where }),
    ]);
    return { data, total };
  }

  async softDelete(id) {
    return prisma.users.update({
      where: { id },
      data: { deleted_at: new Date() }
    });
  }
}

module.exports = new UserRepository();
