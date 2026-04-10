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

  async getDashboardStats() {
    return adminRepository.getDashboardStats();
  }
}

module.exports = new AdminService();
