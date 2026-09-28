require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const AppError = require('../shared/errors/AppError');
const globalErrorHandler = require('../shared/errors/globalErrorHandler');
const eventRoutes = require('../../modules/events/eventRoutes');
const categoryRoutes = require('../../modules/categories/categoryRoutes');
const adminRoutes = require('../../modules/admin/adminRoutes');

const app = express();

app.use(helmet());

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
};
app.use(cors(corsOptions));

const limiter = rateLimit({
  max: process.env.NODE_ENV === 'production' ? 100 : 2000,
  windowMs: 15 * 60 * 1000,
  handler: (req, res, next) =>
    next(new AppError('Bạn đã gửi quá nhiều requests. Vui lòng thử lại sau 15 phút!', 429)),
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) =>
  res.status(200).json({ status: 'ok', service: 'event-catalog-service' })
);
app.get('/api/events/health', (req, res) =>
  res.status(200).json({ status: 'ok', service: 'event-catalog-service' })
);

app.use('/api/events', eventRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on Event Catalog Service!`, 404));
});
app.use(globalErrorHandler);

module.exports = app;
