const prisma = require('../../config/database-analytics');

class AdminRepository {
  async getGenderStats() {
    return prisma.analytics_order_summary.groupBy({
      by: ['user_gender'],
      _count: { _all: true },
      where: { order_status: 'PAID' }
    });
  }

  async getTopSpenders(limit = 5) {
    return prisma.analytics_order_summary.groupBy({
      by: ['user_id'],
      _sum: { total_amount: true },
      where: { order_status: 'PAID' },
      orderBy: { _sum: { total_amount: 'desc' } },
      take: limit
    });
  }

  async getUserById(userId) {
    return prisma.analytics_order_summary.findFirst({ where: { user_id: userId } });
  }

  async getDemographicsByAge() {
    return prisma.$queryRaw`
      SELECT 
        COALESCE(category_name, 'Uncategorized') AS category_name,
        CASE 
          WHEN user_dob IS NULL THEN 'Unknown'
          WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, user_dob)) < 18 THEN '< 18'
          WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, user_dob)) BETWEEN 18 AND 24 THEN '18-24'
          WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, user_dob)) BETWEEN 25 AND 34 THEN '25-34'
          WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, user_dob)) BETWEEN 35 AND 44 THEN '35-44'
          ELSE '45+'
        END AS age_group,
        COUNT(DISTINCT user_id)::int AS user_count
      FROM analytics_order_summary
      WHERE order_status = 'PAID'
      GROUP BY category_name, age_group
      ORDER BY category_name, age_group
    `;
  }

  async getDemographicsByGender() {
    return prisma.$queryRaw`
      SELECT 
        COALESCE(category_name, 'Uncategorized') AS category_name,
        COALESCE(user_gender::text, 'OTHER') AS gender,
        COUNT(DISTINCT user_id)::int AS user_count
      FROM analytics_order_summary
      WHERE order_status = 'PAID'
      GROUP BY category_name, user_gender
      ORDER BY category_name, user_gender
    `;
  }

  async getDemographicsByBoth() {
    return prisma.$queryRaw`
      SELECT 
        COALESCE(category_name, 'Uncategorized') AS category_name,
        COALESCE(user_gender::text, 'OTHER') AS gender,
        CASE 
          WHEN user_dob IS NULL THEN 'Unknown'
          WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, user_dob)) < 18 THEN '< 18'
          WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, user_dob)) BETWEEN 18 AND 24 THEN '18-24'
          WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, user_dob)) BETWEEN 25 AND 34 THEN '25-34'
          WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, user_dob)) BETWEEN 35 AND 44 THEN '35-44'
          ELSE '45+'
        END AS age_group,
        COUNT(DISTINCT user_id)::int AS user_count
      FROM analytics_order_summary
      WHERE order_status = 'PAID'
      GROUP BY category_name, user_gender, age_group
      ORDER BY category_name, user_gender, age_group
    `;
  }

  async getDashboardStats() {
    const revenue = await prisma.analytics_order_summary.aggregate({
      _sum: { total_amount: true },
      where: { order_status: 'PAID' }
    });

    const uniqueUsers = await prisma.analytics_order_summary.groupBy({
      by: ['user_id'],
      _count: { _all: true }
    });

    return {
      revenue: parseFloat(revenue._sum.total_amount || 0),
      seats: {
        total: 0,
        locked: 0,
        sold: uniqueUsers.length,
        available: 0
      },
      usersTotal: uniqueUsers.length
    };
  }

  async getEventAnalytics(eventId) {
    const revenueQuery = await prisma.analytics_order_summary.aggregate({
      _sum: { total_amount: true },
      where: { 
        event_id: eventId,
        order_status: 'PAID' 
      }
    });

    const demographics = await prisma.$queryRaw`
      SELECT 
        COALESCE(user_gender::text, 'OTHER') AS gender,
        CASE 
          WHEN user_dob IS NULL THEN 'Unknown'
          WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, user_dob)) < 18 THEN '< 18'
          WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, user_dob)) BETWEEN 18 AND 24 THEN '18-24'
          WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, user_dob)) BETWEEN 25 AND 34 THEN '25-34'
          WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, user_dob)) BETWEEN 35 AND 44 THEN '35-44'
          ELSE '45+'
        END AS age_group,
        COUNT(DISTINCT user_id)::int AS user_count
      FROM analytics_order_summary
      WHERE event_id = ${eventId}::uuid AND order_status = 'PAID'
      GROUP BY user_gender, age_group
    `;

    return {
      revenue: parseFloat(revenueQuery._sum.total_amount || 0),
      seatStats: [],
      demographics
    };
  }
}

module.exports = new AdminRepository();
