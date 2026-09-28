const customerRepository = require('./customerRepository');
const AppError = require('../../../shared/errors/AppError');
const axios = require('axios');

class CustomerService {
  async getProfile(userId) {
    const user = await customerRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    const { password, ...safeUser } = user;
    return safeUser;
  }

  // API Composition — gọi Booking Service qua HTTP, không truy cập DB trực tiếp
  async getOrderHistory(userId, authHeader) {
    const bookingServiceUrl = process.env.BOOKING_SERVICE_URL || 'http://booking-service:3040';
    try {
      const headers = authHeader ? { Authorization: authHeader } : {};
      const response = await axios.get(`${bookingServiceUrl}/api/booking/purchase-history`, { headers, timeout: 5000 });
      return response.data?.data || [];
    } catch (error) {
      console.error(`[IAM Customer -> Booking] Lỗi lấy order history user ${userId}:`, error.message);
      return [];
    }
  }

  async getLockedSeats(userId, authHeader) {
    const bookingServiceUrl = process.env.BOOKING_SERVICE_URL || 'http://booking-service:3040';
    try {
      const headers = authHeader ? { Authorization: authHeader } : {};
      const response = await axios.get(`${bookingServiceUrl}/api/booking/locked-seats`, { headers, timeout: 5000 });
      return response.data?.data || [];
    } catch (error) {
      console.error(`[IAM Customer -> Booking] Lỗi lấy locked seats user ${userId}:`, error.message);
      return [];
    }
  }

  async updateProfile(userId, { full_name, date_of_birth, gender, avatar_url }) {
    const user = await customerRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    const updateData = {};
    if (full_name !== undefined) updateData.full_name = full_name;
    if (date_of_birth !== undefined) updateData.date_of_birth = date_of_birth ? new Date(date_of_birth) : null;
    if (gender !== undefined) updateData.gender = gender || null;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
    const updated = await customerRepository.update(userId, updateData);
    const { password, ...safeUser } = updated;
    return safeUser;
  }
}

module.exports = new CustomerService();
