const customerRepository = require('./customerRepository');
const AppError = require('../errorHandling/AppError');

class CustomerService {
  async getProfile(userId) {
    const user = await customerRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async getOrderHistory(userId) {
    if (!user) throw new AppError('User not found', 404);
    return customerRepository.getOrderHistory(userId);
  }

  async getLockedSeats(userId) {
    if (!user) throw new AppError('User not found', 404);
    return customerRepository.getLockedSeats(userId);
  }

  async updateProfile(userId, { full_name, date_of_birth, gender, avatar_url }) {
    const updateData = {};
    if (!user) throw new AppError('User not found', 404);
    if (full_name !== undefined) updateData.full_name = full_name;
    if (date_of_birth !== undefined) updateData.date_of_birth = date_of_birth ? new Date(date_of_birth) : null;
    if (gender !== undefined) updateData.gender = gender || null; // Convert empty string to null
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

    const updated = await customerRepository.update(userId, updateData);

    const { password, ...safeUser } = updated;
    return safeUser;
  }
}

module.exports = new CustomerService();
