require('dotenv').config();
const http = require('http');
const app = require('./app');

const redisSubscriber = require('../../config/redisSubscriber');
const { EVENTS } = require('../../config/eventCatalog');

const server = http.createServer(app);
const PORT = process.env.USER_PORT || 3020;

// Subcribe Redis Pub/Sub events theo Event Catalog
if (process.env.DISABLE_REDIS !== 'true') {
  redisSubscriber.subscribe(EVENTS.SEAT_HOLD_EXPIRED, (err) => {
    if (!err) console.log(`🔔 [User Service] Đang lắng nghe kênh Pub/Sub: ${EVENTS.SEAT_HOLD_EXPIRED}`);
  });
  redisSubscriber.on('message', (channel, message) => {
    if (channel === EVENTS.SEAT_HOLD_EXPIRED) {
      try {
        const payload = JSON.parse(message);
        console.log(`[User Service] ⏰ Nhận sự kiện hết giờ giữ ghế cho user ${payload.userId} (eventId: ${payload.eventId})`);
      } catch (err) {}
    }
  });
}

server.listen(PORT, () => {
  console.log('\n[User Service] danh cho: user profiles, roles, avatar upload, purchase history');
  console.log('[User Service] PORT: '+PORT);
  console.log('[User Service] Health: /health\n');
});

const shutdown = (signal) => {
  console.log('\nTin hieu '+signal+' nhan duoc. Dang tat User Service...');
  server.close(() => {
    console.log('User Service da tat.');
    process.exit(0);
  });
};

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
