const userRepository = require('./usersRepository');
const AppError = require('../../../shared/errors/AppError');
const PrismaApiFeatures = require('../../../shared/utils/PrismaApiFeatures');
const bcrypt = require('bcrypt');
const axios = require('axios');

class UserService {
  async getAllUsers(query) {
    const features = new PrismaApiFeatures(query).filter().sort().limitFields().paginate();
    const prismaArgs = features.getArgs();
    const { page, limit } = features.getPagination();
    const { data, total } = await userRepository.findAll(prismaArgs);
    const safeData = data.map(({ password, ...rest }) => rest);
    return { results: safeData.length, total, page, totalPages: Math.ceil(total / limit), data: safeData };
  }

  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    const { password, ...safeUser } = user;
    return safeUser;
  }

  /**
   * API Composition: IAM Service gọi Booking Service qua internal DNS để lấy vé.
   * KHÔNG truy cập DB của booking-service trực tiếp.
   */
  async getMyTickets(userId, authHeader) {
    const bookingServiceUrl = process.env.BOOKING_SERVICE_URL || 'http://booking-service:3040';
    try {
      const headers = authHeader ? { Authorization: authHeader } : {};
      const response = await axios.get(`${bookingServiceUrl}/api/booking/my-tickets`, {
        headers,
        timeout: 5000,
      });
      return response.data?.data || [];
    } catch (error) {
      console.error(`[IAM -> Booking] Lỗi lấy vé cho user ${userId}:`, error.message);
      if (error.response?.status && error.response.status < 500) {
        throw new AppError(error.response.data?.message || 'Lỗi từ dịch vụ vé!', error.response.status);
      }
      throw new AppError('Danh sách vé đang được cập nhật, vui lòng thử lại sau ít phút!', 503);
    }
  }

  async updateProfile(userId, data) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('Người dùng không tồn tại', 404);

    const { date_of_birth, ...otherData } = data;
    let formattedDate = undefined;

    if (date_of_birth !== undefined) {
      if (date_of_birth.trim() === '') {
        formattedDate = null;
      } else {
        formattedDate = new Date(date_of_birth);
        if (isNaN(formattedDate.getTime())) throw new AppError('Định dạng ngày sinh không hợp lệ!', 400);
      }
    }

    const updateData = { ...otherData, ...(formattedDate !== undefined && { date_of_birth: formattedDate }) };
    const updated = await userRepository.update(userId, updateData);
    const { password, ...safeUser } = updated;
    return safeUser;
  }

  async updateRole(userId, newRole) {
    if (!['ADMIN', 'CUSTOMER'].includes(newRole)) {
      throw new AppError('Invalid role. Only ADMIN or CUSTOMER allowed.', 400);
    }
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    const updated = await userRepository.update(userId, { role: newRole });
    const { password, ...safeUser } = updated;
    return safeUser;
  }

  async deleteUser(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    if (user.deleted_at) throw new AppError('User đã bị xóa trước đó', 400);
    await userRepository.softDelete(userId);
  }

  async updatePassword(userId, currentPassword, newPassword) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('Người dùng không tồn tại', 404);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new AppError('Mật khẩu hiện tại không đúng!', 401);
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const updated = await userRepository.update(userId, { password: hashedNewPassword, password_changed_at: new Date() });
    const { password, ...safeUser } = updated;
    return safeUser;
  }
}

module.exports = new UserService();
