const userRepository = require('./usersRepository');
const AppError = require('../errorHandling/AppError');
const PrismaApiFeatures = require('../../utils/PrismaApiFeatures');

class UserService {
  /**
   * GET ALL USERS (Admin only)
   * Hỗ trợ filter, sort, field selection và phân trang qua query string.
   *
   * Ví dụ:
   *   GET /api/users?role=ADMIN&sort=created_at:asc&fields=id,email,role&page=1&limit=20
   *   GET /api/users?created_at[gte]=2025-01-01&sort=full_name:asc
   */
  async getAllUsers(query) {
    const features = new PrismaApiFeatures(query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const prismaArgs = features.getArgs();
    const { page, limit } = features.getPagination();

    const { data, total } = await userRepository.findAll(prismaArgs);

    // Loại bỏ password khỏi từng record
    const safeData = data.map(({ password, ...rest }) => rest);

    return {
      results: safeData.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: safeData,
    };
  }

  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    
    const { password, ...safeUser } = user;
    return safeUser;
  }

 async updateProfile(userId, data) {
    // 1. Kiểm tra người dùng có tồn tại không
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('Người dùng không tồn tại', 404);

    // 2. Tách riêng date_of_birth ra để xử lý đặc biệt, giữ lại các trường còn lại
    const { date_of_birth, ...otherData } = data;
    let formattedDate = undefined; 

    if (date_of_birth !== undefined) {
      if (date_of_birth.trim() === "") {
        // Xóa ngày sinh nếu gửi lên chuỗi rỗng
        formattedDate = null;
      } else {
        // Ép kiểu thành Date object cho Prisma
        formattedDate = new Date(date_of_birth);
        
        if (isNaN(formattedDate.getTime())) {
           throw new AppError('Định dạng ngày sinh không hợp lệ!', 400);
        }
      }
    }

    // 3. Gom dữ liệu an toàn để đưa vào database
    const updateData = {
      ...otherData,
      ...(formattedDate !== undefined && { date_of_birth: formattedDate })
    };

    // 4. Thực hiện cập nhật
    const updated = await userRepository.update(userId, updateData);

    // 5. Lọc bỏ password trước khi gửi về client
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

  /**
   * Soft Delete User
   * Thay vì xóa thật, ta set deleted_at = now().
   * Global filter trong database.js sẽ tự động ẩn user này khỏi mọi query sau đó.
   */
  async deleteUser(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    // Nếu đã bị soft-deleted trước đó (trường hợp bypass filter)
    if (user.deleted_at) throw new AppError('User đã bị xóa trước đó', 400);

    await userRepository.softDelete(userId);
  }

}

module.exports = new UserService();

