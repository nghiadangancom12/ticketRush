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
}

module.exports = new UserRepository();
