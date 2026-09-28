require('dotenv').config();
const Redis = require('ioredis');

const isTls = process.env.REDIS_URL?.startsWith('rediss://');

const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, isTls ? { tls: {} } : {})
  : new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT) || 6379,
    });

redis.on('connect', () => {
  console.log('🔥 [Cache] Đã kết nối thành công tới Redis Server!');
});

redis.on('error', (error) => {
  console.error('❌ [Cache] Lỗi kết nối Redis:', error.message);
});

module.exports = redis;
