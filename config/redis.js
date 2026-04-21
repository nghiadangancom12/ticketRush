const Redis = require('ioredis');

const redisOptions = process.env.REDIS_URL 
  ? process.env.REDIS_URL 
  : {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: process.env.REDIS_PORT || 6379,
    };

// Khởi tạo đối tượng kết nối
const redis = new Redis(redisOptions);

// Bắt sự kiện để biết Redis đã kết nối thành công hay chưa
redis.on('connect', () => {
  console.log('🔥 Đã kết nối thành công tới Redis Server!');
});

redis.on('error', (error) => {
  console.error('❌ Lỗi kết nối Redis:', error);
});

module.exports = redis;