const prisma = require('../../config/database');

class AuthRepository {
  async findByEmail(email) {
    return prisma.users.findUnique({ where: { email } });
  }

  async create(userData) {
    return prisma.users.create({ data: userData });
  }

  async findById(id) {
    return prisma.users.findUnique({ where: { id } });
  }
}

module.exports = new AuthRepository();
