require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const AppError = require('../../modules/errorHandling/AppError');
const globalErrorHandler = require('../../modules/errorHandling/globalErrorHandler');
const eventRoutes = require('../../modules/events/eventRoutes');
const categoryRoutes = require('../../modules/categories/categoryRoutes');
const adminRoutes = require('../../modules/admin/AdminRoutes');

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
  res.status(200).json({ status: 'ok', service: 'event-catalog-service' })
);
app.get('/api/events/health', (req, res) =>
  res.status(200).json({ status: 'ok', service: 'event-catalog-service' })
);

// --- Routes ---
// Events: GET /api/events, GET /api/events/:id, GET /api/events/:id/landing
//         POST /api/events (Admin), PATCH /api/events/:id/image (Admin), DELETE /api/events/:id (Admin)
app.use('/api/events', eventRoutes);

// Categories: GET /api/categories, GET /api/categories/:id
//             POST /api/categories (Admin), PATCH /api/categories/:id (Admin), DELETE /api/categories/:id (Admin)
//             PATCH /api/categories/:id/image (Admin)
app.use('/api/categories', categoryRoutes);

// Admin analytics: GET /api/admin/dashboard, /api/admin/customer-analytics
//                  /api/admin/category-analytics, /api/admin/event-analytics
app.use('/api/admin', adminRoutes);

// --- 404 Handler ---
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on Event Catalog Service!`, 404));
});

// --- Global Error Handler ---
app.use(globalErrorHandler);

module.exports = app;
