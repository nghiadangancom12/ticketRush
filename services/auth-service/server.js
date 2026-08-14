require('dotenv').config();
const http = require('http');
const app = require('./app');

const server = http.createServer(app);
const PORT = process.env.AUTH_PORT || 3010;

server.listen(PORT, () => {
  console.log('\n[Auth Service] danh cho: register, login, logout, forgot/reset password');
  console.log('[Auth Service] PORT: '+PORT);
  console.log('[Auth Service] Health: /health | Verify: /api/auth/verify\n');
});

const shutdown = (signal) => {
  console.log('\nTin hieu '+signal+' nhan duoc. Dang tat Auth Service...');
  server.close(() => {
    console.log('Auth Service da tat.');
    process.exit(0);
  });
};

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
