require('dotenv').config();
const Redis = require('ioredis');

/**
 * Kết nối Redis dành riêng cho BullMQ.
 * maxRetriesPerRequest: null bắt buộc để Workers block nhận jobs.
 */
const redisOptions = {
  maxRetriesPerRequest: null,
  tls: process.env.REDIS_URL?.startsWith('rediss://') ? {} : undefined,
};

const connection = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, redisOptions)
  : new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT) || 6379,
      ...redisOptions,
    });

connection.on('connect', () => {
  console.log('🔥 [BullMQ Redis] Đã kết nối Redis thành công!');
});

connection.on('error', (err) => {
  console.error('❌ [BullMQ Redis] Lỗi kết nối:', err.message);
});

module.exports = connection;
