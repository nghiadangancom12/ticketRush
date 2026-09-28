require('dotenv').config();
const Redis = require('ioredis');

const isTls = process.env.REDIS_URL?.startsWith('rediss://');

const subscriber = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, isTls ? { tls: {} } : {})
  : new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT) || 6379,
    });

subscriber.on('connect', () => {
  console.log('🔔 [Redis Subscriber] Đã kết nối thành công!');
});

subscriber.on('error', (err) => {
  console.error('❌ [Redis Subscriber] Lỗi kết nối:', err.message);
});

module.exports = subscriber;
