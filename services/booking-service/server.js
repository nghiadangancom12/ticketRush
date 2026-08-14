require('dotenv').config();
const http = require('http');
const app = require('./app');

const server = http.createServer(app);
const PORT = process.env.BOOKING_PORT || 3040;

server.listen(PORT, () => {
  console.log('\n[Booking Service] danh cho: hold, checkout, return seats, orders');
  console.log('[Booking Service] PORT: '+PORT);
  console.log('[Booking Service] Health: /health\n');
});

const shutdown = (signal) => {
  console.log('\nTin hieu '+signal+' nhan duoc. Dang tat Booking Service...');
  server.close(() => {
    console.log('Booking Service da tat.');
    process.exit(0);
  });
};

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
