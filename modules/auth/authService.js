const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authRepository = require('./authRepository');
const AppError = require('../errorHandling/AppError');

class AuthService {
  _signToken(id, role) {
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is missing');
    return jwt.sign(
      { id, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
  }

  async register({ email, password, full_name, date_of_birth, gender }) {
    if (!email || !password || !full_name) {
      throw new AppError('Thiếu thông tin bắt buộc!', 400);
    }

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

    const token = this._signToken(user.id, user.role);
    return { user, token };
  }

  async login({ email, password }) {
    if (!email || !password) throw new AppError('Vui lòng nhập email và mật khẩu', 400);

    const user = await authRepository.findByEmail(email);
    if (!user) throw new AppError('Sai email hoặc mật khẩu!', 401);

    const passwordIsValid = await bcrypt.compare(password, user.password);
    if (!passwordIsValid) throw new AppError('Sai email hoặc mật khẩu!', 401);

    const token = this._signToken(user.id, user.role);
    return { user, token };
  }
}

module.exports = new AuthService();