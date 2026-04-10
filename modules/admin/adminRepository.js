const prisma = require('../../config/database');

class AdminRepository {
  async getGenderStats() {
    return prisma.users.groupBy({
      by: ['gender'],
      _count: { _all: true },
      where: { role: 'CUSTOMER' }
    });
  }

  async getTopSpenders(limit = 5) {
    return prisma.orders.groupBy({
      by: ['user_id'],
      _sum: { total_amount: true },
      where: { status: 'PAID' },
      orderBy: { _sum: { total_amount: 'desc' } },
      take: limit
    });
  }

  async getUserById(userId) {
    return prisma.users.findUnique({ where: { id: userId } });
  }

  async getDashboardStats() {
    const revenue = await prisma.orders.aggregate({
      _sum: { total_amount: true },
      where: { status: 'PAID' }
    });

    const seats = await Promise.all([
      prisma.seats.count(),
      prisma.seats.count({ where: { status: 'LOCKED' } }),
      prisma.seats.count({ where: { status: 'SOLD' } }),
      prisma.seats.count({ where: { status: 'AVAILABLE' } })
    ]);

    const usersCount = await prisma.users.count({
      where: { role: 'CUSTOMER' }
    });

    return {
      revenue: parseFloat(revenue._sum.total_amount || 0),
      seats: {
        total: seats[0],
        locked: seats[1],
        sold: seats[2],
        available: seats[3]
      },
      usersTotal: usersCount
    };
  }
}

module.exports = new AdminRepository();
