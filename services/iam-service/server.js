require('dotenv').config();
const http = require('http');
const app = require('./app');

const PORT = process.env.IAM_PORT || 3010;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log('\n[IAM Service] Khởi động thành công!');
  console.log(`[IAM Service] PORT: ${PORT}`);
  console.log(`[IAM Service] Health: http://localhost:${PORT}/health\n`);
});

const shutdown = (signal) => {
  console.log(`\nTín hiệu ${signal} nhận được. Đang tắt IAM Service...`);
  server.close(() => {
    console.log('IAM Service đã tắt an toàn.');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000);
};

process.on('unhandledRejection', (err) => {
  console.error('[IAM Service] Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
