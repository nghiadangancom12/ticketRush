// IAM Service — Customer Repository (auth_db)
// ⚠️  Customer profile data lives in auth_db.users (same service boundary as IAM)
const prisma = require('../../config/database-auth');

class CustomerRepository {
  async findById(userId) {
    return prisma.users.findUnique({ where: { id: userId } });
  }

  async update(userId, data) {
    if (data.gender === '') data.gender = null;
    return prisma.users.update({ where: { id: userId }, data });
  }
}

module.exports = new CustomerRepository();
