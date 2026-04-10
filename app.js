const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const AppError = require('./modules/errorHandling/AppError');
const globalErrorHandler = require('./modules/errorHandling/globalErrorHandler');

// Swagger
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));

const app = express();

// ✅ CORS Configuration - Cho phép credentials (cookies)  
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Chỉ định Frontend URL (VỚI port)
  credentials: true, // 🔑 BẮT BUỘC: Cho phép gửi/nhận cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 1 ngày
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser()); // ✅ Parse cookies từRequest Headers

// API Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// === ROUTES (chuẩn MCS) ===
app.use('/api/auth',      require('./modules/auth/authRoutes'));
app.use('/api/users',     require('./modules/users/usersRoutes'));
app.use('/api/events',    require('./modules/events/eventRoutes'));
app.use('/api/seats',     require('./modules/seats/seatRoutes'));
app.use('/api/customers', require('./modules/customers/customerRoutes'));
app.use('/api/admin',     require('./modules/admin/AdminRoutes'));

// 404 handler
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(globalErrorHandler);

module.exports = app;
