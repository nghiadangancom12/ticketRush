require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const AppError = require('../../modules/errorHandling/AppError');
const globalErrorHandler = require('../../modules/errorHandling/globalErrorHandler');
const authRoutes = require('../../modules/auth/authRoutes');

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

// --- Rate Limit (chặt hơn để chống brute-force) ---
const limiter = rateLimit({
  max: process.env.NODE_ENV === 'production' ? 20 : 500,
  windowMs: 15 * 60 * 1000,
  handler: (req, res, next) => {
    return next(new AppError('Ban da gui qua nhieu requests. Vui long thu lai sau 15 phut!', 429));
  },
});
app.use('/api', limiter);

// --- Body Parser & Cookies ---
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// --- Health Check ---
app.get('/health', (req, res) =>
  res.status(200).json({ status: 'ok', service: 'auth-service' })
);

/**
 * Internal JWT Verify Endpoint (danh cho cac service khac xac thuc token).
 * Chi verify chu ky JWT (khong hit DB) -> hieu suat cao.
 * GET /api/auth/verify
 * Authorization: Bearer <token>
 */
app.get('/api/auth/verify', (req, res) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({ status: 'fail', message: 'Token khong duoc cung cap.' });
    }
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ status: 'error', message: 'JWT_SECRET chua duoc cau hinh.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({
      status: 'success',
      data: { id: decoded.id, role: decoded.role, iat: decoded.iat, exp: decoded.exp },
    });
  } catch (err) {
    return res.status(401).json({ status: 'fail', message: 'Token khong hop le hoac da het han.' });
  }
});

// --- Auth Routes ---
app.use('/api/auth', authRoutes);

// --- 404 Handler ---
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on Auth Service!`, 404));
});

// --- Global Error Handler ---
app.use(globalErrorHandler);

module.exports = app;
