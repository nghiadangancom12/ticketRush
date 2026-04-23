const Redis = require('ioredis');

// Kiểm tra xem URL có yêu cầu bảo mật SSL/TLS không
const isTls = process.env.REDIS_URL?.startsWith('rediss://');

// Nếu có REDIS_URL, nhét thêm option tls vào tham số thứ 2
const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, isTls ? { tls: {} } : {})
  : new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT) || 6379,
    });

// Bắt sự kiện để biết Redis đã kết nối thành công hay chưa
redis.on('connect', () => {
  console.log('🔥 [Cache] Đã kết nối thành công tới Redis Server!');
});

redis.on('error', (error) => {
  console.error('❌ [Cache] Lỗi kết nối Redis:', error.message);
});

module.exports = redis;