require('dotenv').config();
const http = require('http');
const app = require('./app');

// ─── HTTP Server (Core API) ────────────────────────────────────────────────
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🚀 TicketRush Core API server đang chạy tại http://localhost:${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
  console.log(`📡 Core API Endpoints Ready | Health: /health\n`);
});

// ─── Graceful Shutdown ─────────────────────────────────────────────────────
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM nhận được. Đang tắt Core API server...');
  server.close(() => {
    console.log('✅ Core API Server đã tắt.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('⚠️  SIGINT nhận được. Đang tắt Core API server...');
  server.close(() => {
    console.log('✅ Core API Server đã tắt.');
    process.exit(0);
  });
});