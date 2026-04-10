const prisma = require('../../config/database');

class CustomerRepository {
  async findById(userId) {
    return prisma.users.findUnique({
      where: { id: userId }
    });
  }

  async getOrderHistory(userId) {
    return prisma.orders.findMany({
      where: { user_id: userId },
      include: {
        tickets: {
          include: {
            seats: { include: { zones: true } }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async getLockedSeats(userId) {
    return prisma.seats.findMany({
      where: { locked_by: userId, status: 'LOCKED' },
      include: { zones: { include: { events: true } } }
    });
  }

  async update(userId, data) {
    // Convert empty string to null for gender enum
    if (data.gender === '') {
      data.gender = null;
    }
    return prisma.users.update({
      where: { id: userId },
      data
    });
  }
}

module.exports = new CustomerRepository();
