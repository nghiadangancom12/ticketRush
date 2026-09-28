const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const authRepository = require('./authRepository');
const AppError = require('../../../shared/errors/AppError');
const EmailService = require('../../utils/email');
const redisPublisher = require('../../../shared/config/redisPublisher');
const { EVENTS } = require('../../../shared/config/eventCatalog');

class AuthService {
  _signToken(id, role) {
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is missing');
    return jwt.sign(
      { id, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
  }

  _filterUserResponse(user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async register({ email, password, full_name, date_of_birth, gender }) {
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

    // Fire-and-forget welcome email
    EmailService.sendWelcomeEmail(user.email, user.full_name)
      .catch(err => console.error(`❌ Email Error:`, err.message));

    // Publish analytics event (fire-and-forget)
    redisPublisher.publish(EVENTS.ANALYTICS_USER_REGISTERED, JSON.stringify({
      userId: user.id,
      email: user.email,
      gender: user.gender,
      dateOfBirth: user.date_of_birth,
    })).catch(err => console.error('[IAM] Publish user_registered failed:', err.message));

    const token = this._signToken(user.id, user.role);
    return { user: this._filterUserResponse(user), token };
  }

  async login({ email, password }) {
    const user = await authRepository.findByEmail(email);
    if (!user) throw new AppError('Sai email hoặc mật khẩu!', 401);

    const passwordIsValid = await bcrypt.compare(password, user.password);
    if (!passwordIsValid) throw new AppError('Sai email hoặc mật khẩu!', 401);

    const token = this._signToken(user.id, user.role);
    return { user: this._filterUserResponse(user), token };
  }

  async forgotPassword(email, protocol, host) {
    const user = await authRepository.findByEmail(email);
    if (!user) throw new AppError('Không có người dùng với địa chỉ email này.', 404);

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    await authRepository.update(user.id, {
      password_reset_token: hashedToken,
      password_reset_expires: new Date(Date.now() + 10 * 60 * 1000)
    });

    const frontendUrl = process.env.FRONTEND_URL || `${protocol}://${host}`;
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    try {
      await EmailService.sendPasswordResetEmail(user.email, resetUrl);
    } catch (err) {
      await authRepository.update(user.id, {
        password_reset_token: null,
        password_reset_expires: null
      });
      throw new AppError('Đã có lỗi xảy ra khi gửi email. Vui lòng thử lại sau.', 500);
    }
  }

  async resetPassword(token, newPassword) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await authRepository.findByResetToken(hashedToken);
    if (!user) throw new AppError('Token không hợp lệ hoặc đã hết hạn.', 400);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await authRepository.update(user.id, {
      password: hashedPassword,
      password_changed_at: new Date(),
      password_reset_token: null,
      password_reset_expires: null
    });

    const authToken = this._signToken(updatedUser.id, updatedUser.role);
    return { user: this._filterUserResponse(updatedUser), token: authToken };
  }
}

module.exports = new AuthService();
