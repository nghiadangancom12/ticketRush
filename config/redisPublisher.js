require('dotenv').config();
const Redis = require('ioredis');

/**
 * Kết nối Redis riêng dành cho Publisher (Pub/Sub).
 * Dùng để publish các sự kiện như seatStatusChanged, queueTurn
 * tới Redis Subscriber mà không làm block connection khác.
 */
const isTls = process.env.REDIS_URL?.startsWith('rediss://');

const publisher = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, isTls ? { tls: {} } : {})
  : new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT) || 6379,
    });

publisher.on('connect', () => {
  console.log('📡 [Redis Publisher] Đã kết nối thành công!');
});

publisher.on('error', (err) => {
  console.error('❌ [Redis Publisher] Lỗi kết nối:', err.message);
});

module.exports = publisher;
