const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const AppError = require('./modules/errorHandling/AppError');
const globalErrorHandler = require('./modules/errorHandling/globalErrorHandler');

// 🚀 THÊM MỚI Ở ĐÂY: Khởi tạo kết nối Redis ngay khi app vừa chạy lên
const redis = require('./config/redis'); 

// Swagger
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));

const app = express();

// ✅ CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// API Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 🚀 THÊM MỚI Ở ĐÂY: API Test Redis (Bạn có thể xóa đi sau khi test thành công)
app.get('/api/test-redis', async (req, res, next) => {
  try {
    // Thử ghi dữ liệu vào Redis RAM
    await redis.set('ticketrush_system', 'Hệ thống Redis hoạt động siêu tốc! ⚡', 'EX', 60); 
    // Đọc dữ liệu ra
    const data = await redis.get('ticketrush_system');
    res.status(200).json({ status: 'success', message: data });
  } catch (err) {
    next(new AppError('Lỗi kết nối Redis: ' + err.message, 500));
  }
});

// === ROUTES (chuẩn MCS) ===
app.use('/api/auth',      require('./modules/auth/authRoutes'));
app.use('/api/users',     require('./modules/users/usersRoutes'));
app.use('/api/events',    require('./modules/events/eventRoutes'));
app.use('/api/Booking',   require('./modules/Booking/BookingRoutes'));
app.use('/api/queue',     require('./modules/queue/queueRoutes'));
app.use('/api/customers', require('./modules/customers/CustomerRoutes'));
app.use('/api/admin',     require('./modules/admin/AdminRoutes'));

// 404 handler
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(globalErrorHandler);

module.exports = app;