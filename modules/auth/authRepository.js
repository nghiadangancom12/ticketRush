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

  async update(id, data) {
    return prisma.users.update({
      where: { id },
      data
    });
  }

  async findByResetToken(hashedToken) {
    return prisma.users.findFirst({
      where: {
        password_reset_token: hashedToken,
        password_reset_expires: { gt: new Date() }
      }
    });
  }
}

module.exports = new AuthRepository();
