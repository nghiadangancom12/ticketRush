const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const AppError = require('../../modules/errorHandling/AppError');
const globalErrorHandler = require('../../modules/errorHandling/globalErrorHandler');
const queueRoutes = require('../../modules/queue/queueRoutes');

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
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Healthcheck
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', service: 'virtual-queue-service' }));
app.get('/api/queue/health', (req, res) => res.status(200).json({ status: 'ok', service: 'virtual-queue-service' }));

// Dedicated Virtual Queue API Routes
app.use('/api/queue', queueRoutes);

// 404 Handler
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on Virtual Queue Service!`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

module.exports = app;
