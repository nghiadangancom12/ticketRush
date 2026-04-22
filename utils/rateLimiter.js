const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const redis = require('../config/redis'); // 👉 File cấu hình Redis của Nghĩa

const joinQueueLimiter = rateLimit({
  // Sử dụng Redis để lưu trữ số lần request
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }),
  
  windowMs: 10 * 1000, // ⏳ Khoảng thời gian: 10 giây
  max: 3,              // 🚫 Giới hạn: Tối đa 3 lần request trong 10 giây
  
  // Cách định danh người dùng: 
  // Nếu có userId (đã đăng nhập) thì dùng userId, nếu không dùng IP
 keyGenerator: (req) => {
  // Nếu có header 'x-user-id' từ Artillery gửi lên thì dùng, không thì mới dùng IP
  return req.headers['x-user-id'] || req.ip; 
},

  // Phản hồi khi người dùng bị "chặn"
  handler: (req, res) => {
    res.status(429).json({
      status: 'error',
      message: 'Bạn đang thao tác quá nhanh! Vui lòng đợi 10 giây rồi thử lại.'
    });
  },
  
  standardHeaders: true, // Trả về thông tin giới hạn trong header RateLimit-*
  legacyHeaders: false,  // Tắt X-RateLimit-* cũ
});

module.exports = joinQueueLimiter;