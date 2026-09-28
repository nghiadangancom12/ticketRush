require('dotenv').config();
const http = require('http');
const app = require('./app');

const server = http.createServer(app);
const PORT = process.env.USER_PORT || 3020;

server.listen(PORT, () => {
  console.log('\n[User Service] danh cho: user profile, admin role update, customer history');
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
