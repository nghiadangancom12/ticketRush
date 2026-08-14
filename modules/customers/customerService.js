const customerRepository = require('./customerRepository');
const AppError = require('../errorHandling/AppError');
const axios = require('axios');

class CustomerService {
  async getProfile(userId) {
    const user = await customerRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    
    const { password, ...safeUser } = user;
    return safeUser;
  }

  /**
   * API Composition: Gọi Booking Service sang /api/booking/purchase-history để lấy đơn hàng của user
   */
  async getOrderHistory(userId, authHeader) {
    const user = await customerRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const bookingServiceUrl = process.env.BOOKING_SERVICE_URL || 'http://localhost:3040';
    try {
      const headers = {};
      if (authHeader) headers.Authorization = authHeader;

      const response = await axios.get(`${bookingServiceUrl}/api/booking/purchase-history`, {
        headers,
        timeout: 1000,
      });

      return response.data?.data || [];
    } catch (error) {
      console.error(`[CustomerService -> BookingService] Lỗi lấy order history cho user ${userId}:`, error.message);
      return [];
    }
  }

  /**
   * API Composition: Gọi Booking Service sang /api/booking/locked-seats để lấy ghế đang giữ của user
   */
  async getLockedSeats(userId, authHeader) {
    const user = await customerRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const bookingServiceUrl = process.env.BOOKING_SERVICE_URL || 'http://localhost:3040';
    try {
      const headers = {};
      if (authHeader) headers.Authorization = authHeader;

      const response = await axios.get(`${bookingServiceUrl}/api/booking/locked-seats`, {
        headers,
        timeout: 1000,
      });

      return response.data?.data || [];
    } catch (error) {
      console.error(`[CustomerService -> BookingService] Lỗi lấy locked seats cho user ${userId}:`, error.message);
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
