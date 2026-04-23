// Sửa lại dòng import: Lấy cả rateLimit và ipKeyGenerator từ thư viện
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const redis = require('../config/redis');

const joinQueueLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }),
  
  windowMs: 10 * 1000, 
  max: 3,              
  
  keyGenerator: (req, res) => {
    // 1. KÊNH WEB: Cookie 
    if (req.cookies && req.cookies.sessionId) {
      return `cookie_${req.cookies.sessionId}`; 
    }

    // 2. KÊNH MOBILE / POSTMAN: Bearer Token
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      return `token_${token}`;
    }

    // 3. KÊNH TEST (ARTILLERY): Header giả lập
    if (req.headers['x-user-id']) {
      return `test_${req.headers['x-user-id']}`;
    }

    // 4. KÊNH KHÁCH VÃNG LAI: 
    // KHÔNG dùng req.ip nữa để không bị thư viện bắt lỗi.
    // Trực tiếp đưa req và res cho hàm chuẩn của thư viện tự xử lý IP an toàn!
    return ipKeyGenerator(req, res);
  },

  handler: (req, res) => {
    res.status(429).json({
      status: 'error',
      message: 'Bạn đang thao tác quá nhanh! Vui lòng đợi 10 giây rồi thử lại.'
    });
  },
  
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = joinQueueLimiter;