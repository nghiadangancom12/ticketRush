require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const AppError = require('../shared/errors/AppError');
const globalErrorHandler = require('../shared/errors/globalErrorHandler');
const bookingRoutes = require('../../modules/Booking/BookingRoutes');
const orderRoutes = require('../../modules/orders/orderRoutes');

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
  max: process.env.NODE_ENV === 'production' ? 200 : 2000,
  windowMs: 15 * 60 * 1000,
  handler: (req, res, next) =>
    next(new AppError('Bạn đã gửi quá nhiều requests. Vui lòng thử lại sau 15 phút!', 429)),
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.get('/health', (req, res) =>
  res.status(200).json({ status: 'ok', service: 'booking-service' })
);
app.get('/api/booking/health', (req, res) =>
  res.status(200).json({ status: 'ok', service: 'booking-service' })
);

app.use('/api/booking', bookingRoutes);
app.use('/api/Booking', bookingRoutes);
app.use('/api/orders', orderRoutes);

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on Booking Service!`, 404));
});
app.use(globalErrorHandler);

module.exports = app;
