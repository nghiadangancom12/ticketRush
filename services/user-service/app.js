require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const AppError = require('../../modules/errorHandling/AppError');
const globalErrorHandler = require('../../modules/errorHandling/globalErrorHandler');
const usersRoutes = require('../../modules/users/usersRoutes');
const customerRoutes = require('../../modules/customers/customerRoutes');

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

// --- Rate Limit ---
const limiter = rateLimit({
  max: process.env.NODE_ENV === 'production' ? 100 : 2000,
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
  res.status(200).json({ status: 'ok', service: 'user-service' })
);
app.get('/api/users/health', (req, res) =>
  res.status(200).json({ status: 'ok', service: 'user-service' })
);

// --- Routes ---
// Users: GET /api/users, PATCH /:userId/grant-admin, PATCH /:userId/revoke-admin, DELETE /:userId
//        GET /me, GET /me/tickets, PATCH /me, PATCH /me/avatar, PATCH /me/updatePassword
app.use('/api/users', usersRoutes);

// Customers: GET /api/customers/purchaseHistory
app.use('/api/customers', customerRoutes);

// --- 404 Handler ---
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on User Service!`, 404));
});

// --- Global Error Handler ---
app.use(globalErrorHandler);

module.exports = app;
