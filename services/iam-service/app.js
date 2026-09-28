require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const AppError = require('../shared/errors/AppError');
const globalErrorHandler = require('../shared/errors/globalErrorHandler');
const authRoutes = require('./src/auth/authRoutes');
const usersRoutes = require('./src/users/usersRoutes');
const customerRoutes = require('./src/customers/customerRoutes');

const app = express();

// --- Security Headers ---
app.use(helmet());

// --- CORS ---
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
};
app.use(cors(corsOptions));

// --- Rate Limit (strict — chống brute-force) ---
const authLimiter = rateLimit({
  max: process.env.NODE_ENV === 'production' ? 20 : 500,
  windowMs: 15 * 60 * 1000,
  handler: (req, res, next) =>
    next(new AppError('Bạn đã gửi quá nhiều requests. Vui lòng thử lại sau 15 phút!', 429)),
});
app.use('/api/auth', authLimiter);

const generalLimiter = rateLimit({
  max: process.env.NODE_ENV === 'production' ? 120 : 2000,
  windowMs: 15 * 60 * 1000,
  handler: (req, res, next) =>
    next(new AppError('Bạn đã gửi quá nhiều requests. Vui lòng thử lại sau 15 phút!', 429)),
});
app.use('/api/users', generalLimiter);
app.use('/api/customers', generalLimiter);

// --- Body Parser & Cookies ---
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// --- Static files (avatars) ---
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// --- Health Check ---
app.get('/health', (req, res) =>
  res.status(200).json({ status: 'ok', service: 'iam-service' })
);

/**
 * Internal JWT Verify Endpoint.
 * Dùng cho các service nội bộ xác thực token không cần query DB.
 * GET /api/auth/verify
 * Authorization: Bearer <token>
 */
app.get('/api/auth/verify', (req, res) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) return res.status(401).json({ status: 'fail', message: 'Token không được cung cấp.' });
    if (!process.env.JWT_SECRET) return res.status(500).json({ status: 'error', message: 'JWT_SECRET chưa được cấu hình.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({
      status: 'success',
      data: { id: decoded.id, role: decoded.role, iat: decoded.iat, exp: decoded.exp },
    });
  } catch (err) {
    return res.status(401).json({ status: 'fail', message: 'Token không hợp lệ hoặc đã hết hạn.' });
  }
});

// --- Routes ---
app.use('/api/auth',      authRoutes);
app.use('/api/users',     usersRoutes);
app.use('/api/customers', customerRoutes);

// --- 404 Handler ---
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on IAM Service!`, 404));
});

// --- Global Error Handler ---
app.use(globalErrorHandler);

module.exports = app;
