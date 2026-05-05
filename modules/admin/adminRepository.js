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

  async getDemographicsByAge() {
    return prisma.$queryRaw`
      SELECT 
        c.name AS category_name,
        CASE 
          WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, u.date_of_birth)) < 18 THEN '< 18'
          WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, u.date_of_birth)) BETWEEN 18 AND 24 THEN '18-24'
          WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, u.date_of_birth)) BETWEEN 25 AND 34 THEN '25-34'
          WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, u.date_of_birth)) BETWEEN 35 AND 44 THEN '35-44'
          ELSE '45+'
        END AS age_group,
        COUNT(DISTINCT u.id)::int AS user_count
      FROM categories c
      JOIN events e ON e.category_id = c.id
      JOIN orders o ON o.event_id = e.id AND o.status = 'PAID'
      JOIN users u ON u.id = o.user_id
      GROUP BY category_name, age_group
      ORDER BY category_name, age_group
    `;
  }

  async getDemographicsByGender() {
    return prisma.$queryRaw`
      SELECT 
        c.name AS category_name,
        u.gender,
        COUNT(DISTINCT u.id)::int AS user_count
      FROM categories c
      JOIN events e ON e.category_id = c.id
      JOIN orders o ON o.event_id = e.id AND o.status = 'PAID'
      JOIN users u ON u.id = o.user_id
      GROUP BY category_name, u.gender
      ORDER BY category_name, u.gender
    `;
  }

  async getDemographicsByBoth() {
    return prisma.$queryRaw`
      SELECT 
        c.name AS category_name,
        u.gender,
        CASE 
          WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, u.date_of_birth)) < 18 THEN '< 18'
          WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, u.date_of_birth)) BETWEEN 18 AND 24 THEN '18-24'
          WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, u.date_of_birth)) BETWEEN 25 AND 34 THEN '25-34'
          WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, u.date_of_birth)) BETWEEN 35 AND 44 THEN '35-44'
          ELSE '45+'
        END AS age_group,
        COUNT(DISTINCT u.id)::int AS user_count
      FROM categories c
      JOIN events e ON e.category_id = c.id
      JOIN orders o ON o.event_id = e.id AND o.status = 'PAID'
      JOIN users u ON u.id = o.user_id
      GROUP BY category_name, u.gender, age_group
      ORDER BY category_name, u.gender, age_group
    `;
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
