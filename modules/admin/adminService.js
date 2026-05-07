const adminRepository = require('./adminRepository');

class AdminService {
  async getProfile(userId) {
    const user = await adminRepository.getUserById(userId);
    if (!user) throw new Error('User not found');
    
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async getCustomerAnalytics() {
    const genderStats = await adminRepository.getGenderStats();
    const topSpenders = await adminRepository.getTopSpenders(5);

    const spenderDetails = await Promise.all(
      topSpenders.map(async (ts) => {
        const u = await adminRepository.getUserById(ts.user_id);
        return {
          email: u.email,
          full_name: u.full_name,
          total_spent: ts._sum.total_amount
        };
      })
    );

    return {
      genderDemographics: genderStats,
      topSpenders: spenderDetails
    };
  }

  async getCategoryAnalytics(groupBy) {
    if (groupBy === 'age') {
      return await adminRepository.getDemographicsByAge();
    } else if (groupBy === 'gender') {
      return await adminRepository.getDemographicsByGender();
    } else {
      return await adminRepository.getDemographicsByBoth();
    }
  }

  async getDashboardStats() {
    return adminRepository.getDashboardStats();
  }

  async getEventAnalytics(eventId) {
    if (!eventId) throw new Error('eventId is required');

    const data = await adminRepository.getEventAnalytics(eventId);

    let ticketsSold = 0;
    let ticketsUnsold = 0;
    data.seatStats.forEach(stat => {
      if (stat.status === 'SOLD') ticketsSold += stat._count;
      else ticketsUnsold += stat._count; // AVAILABLE or LOCKED
    });

    let maleCount = 0;
    let femaleCount = 0;
    const ageRanges = {
      '< 18': 0,
      '18-24': 0,
      '25-34': 0,
      '35-44': 0,
      '45+': 0
    };

    data.demographics.forEach(demo => {
      if (demo.gender === 'MALE') maleCount += demo.user_count;
      if (demo.gender === 'FEMALE') femaleCount += demo.user_count;
      
      if (ageRanges[demo.age_group] !== undefined) {
        ageRanges[demo.age_group] += demo.user_count;
      }
    });

    return {
      revenue: data.revenue,
      ticketsSold,
      ticketsUnsold,
      audienceDemographics: {
        gender: {
          MALE: maleCount,
          FEMALE: femaleCount
        },
        ageRanges
      }
    };
  }
}

module.exports = new AdminService();
