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
app.set('query parser', 'extended'); // BẮT BUỘC để parse các tham số object lồng nhau như ?created_at[gte]=...

const { xss } = require('express-xss-sanitizer');
const hpp = require('hpp');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// 1. Set security HTTP headers (Helmet)
app.use(helmet());

// ✅ CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
};

app.use(cors(corsOptions));

// 2. Chống dội bom request (Rate Limiting)
// Giới hạn 100 requests / 15 phút cho cùng 1 IP
const limiter = rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000,
  message: 'Bạn đã gửi quá nhiều requests từ IP này, vui lòng thử lại sau 15 phút!'
});
app.use('/api', limiter);

// 3. Body parser, giới hạn payload tối đa 10kb (Chống hacker nhồi data làm sập RAM)
app.use(express.json({ limit: '10kb' }));

// 4. XSS CLEAN: Lọc bỏ script độc hại (BẮT BUỘC ĐẶT SAU express.json)
app.use(xss());

// 5. HPP: Chống dội bom tham số (Parameter Pollution)
app.use(hpp({
  whitelist: [
    'sort',        // Cho phép sort nhiều cột (VD: sort=price&sort=created_at)
    'fields',      // Cho phép chọn nhiều trường hiển thị
    'category_id', // Lọc sự kiện theo nhiều danh mục cùng lúc
    'status',      // Lọc đơn hàng/sự kiện theo nhiều trạng thái cùng lúc
    'role'         // Lọc user theo nhiều role cùng lúc (Admin/Customer)
  ]
}));
app.use(cookieParser());

// 📂 Serve static files (uploaded images: /img/events/*.webp, /img/avatars/*.webp)
app.use(express.static(path.join(__dirname, 'public')));

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
app.use('/api/orders',    require('./modules/orders/orderRoutes'));
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