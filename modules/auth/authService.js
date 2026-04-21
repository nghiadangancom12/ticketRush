const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const authRepository = require('./authRepository');
const AppError = require('../errorHandling/AppError');
const EmailService = require('../../utils/email.js');

class AuthService {
  _signToken(id, role) {
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is missing');
    return jwt.sign(
      { id, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
  }

  // Hàm bổ trợ để lọc bỏ password trước khi gửi về client
  _filterUserResponse(user) {
    // Với Prisma, dữ liệu trả về đã là Object thuần. 
    // Dùng destructuring để bóc tách trường 'password' ra, lấy tất cả các trường còn lại
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async register({ email, password, full_name, date_of_birth, gender }) {
    // 1. Lưu ý: Thuộc tính 'passwordConfirm' không được extract ở đây, 
    // nên nó sẽ tự động bị bỏ qua, đảm bảo Database Prisma không bị rác.

    const existingUser = await authRepository.findByEmail(email);
    if (existingUser) throw new AppError('Email đã được sử dụng', 400);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await authRepository.create({
      email,
      password: hashedPassword,
      full_name,
      date_of_birth: date_of_birth ? new Date(date_of_birth) : null,
      gender: gender || null,
      role: 'CUSTOMER' 
    });

    // 2. Fire-and-forget email
    EmailService.sendWelcomeEmail(user.email, user.full_name)
      .catch(err => console.error(`❌ Email Error:`, err.message));

    const token = this._signToken(user.id, user.role);

    return { 
      user: this._filterUserResponse(user), 
      token 
    };
  }

  async login({ email, password }) {
    // Lấy user kèm theo password để so sánh
    const user = await authRepository.findByEmail(email);
    if (!user) throw new AppError('Sai email hoặc mật khẩu!', 401);

    const passwordIsValid = await bcrypt.compare(password, user.password);
    if (!passwordIsValid) throw new AppError('Sai email hoặc mật khẩu!', 401);

    const token = this._signToken(user.id, user.role);

    return { 
      user: this._filterUserResponse(user), 
      token 
    };
  }

  async forgotPassword(email, protocol, host) {
    // 1. Tìm user theo email
    const user = await authRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Không có người dùng với địa chỉ email này.', 404);
    }

    // 2. Tạo token ngẫu nhiên
    const resetToken = crypto.randomBytes(32).toString('hex');

    // 3. Hash token và lưu vào DB kèm thời gian hết hạn (10 phút)
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    await authRepository.update(user.id, {
      password_reset_token: hashedToken,
      password_reset_expires: new Date(Date.now() + 10 * 60 * 1000)
    });

    // 4. Gửi email reset
    const frontendUrl = process.env.FRONTEND_URL || `${protocol}://${host}`;
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    try {
      await EmailService.sendPasswordResetEmail(user.email, resetUrl);
    } catch (err) {
      // Nếu gửi mail lỗi, dọn dẹp các trường token trong DB
      await authRepository.update(user.id, {
        password_reset_token: null,
        password_reset_expires: null
      });
      throw new AppError('Đã có lỗi xảy ra khi gửi email. Vui lòng thử lại sau.', 500);
    }
  }

  async resetPassword(token, newPassword) {
    // 1. Hash token nhận được từ URL để so sánh với DB
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // 2. Tìm user theo hashedToken (Repo đã check sẵn expiry)
    const user = await authRepository.findByResetToken(hashedToken);
    if (!user) {
      throw new AppError('Token không hợp lệ hoặc đã hết hạn.', 400);
    }

    // 3. Cập nhật password mới và dọn dẹp token
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await authRepository.update(user.id, {
      password: hashedPassword,
      password_changed_at: new Date(),
      password_reset_token: null,
      password_reset_expires: null
    });

    // 4. Trả về token đăng nhập mới luôn
    const authToken = this._signToken(updatedUser.id, updatedUser.role);

    return {
      user: this._filterUserResponse(updatedUser),
      token: authToken
    };
  }
}

module.exports = new AuthService();