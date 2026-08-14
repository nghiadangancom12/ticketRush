require('dotenv').config();
const http = require('http');
const app = require('./app');

// Chế độ Worker nhúng (Embedded) — Tùy chọn nếu người dùng vẫn muốn chạy chung trong 1 container
const enableEmbeddedWorker = process.env.ENABLE_EMBEDDED_WORKER === 'true';
let queueWorker = null;

if (enableEmbeddedWorker) {
  if (process.env.DISABLE_REDIS !== 'true') {
    queueWorker = require('../../modules/jobs/workers/queueWorker');
    queueWorker.start();
    console.log('🛡️  [Virtual Queue Service] Embedded Virtual Queue Worker đã khởi động!');
  } else {
    console.log('⚠️  [Virtual Queue Service] Redis bị tắt bằng DISABLE_REDIS=true');
  }
} else {
  console.log('ℹ️  [Virtual Queue Service] Queue Worker chạy độc lập ở service worker-queue.');
}

const server = http.createServer(app);
const PORT = process.env.QUEUE_PORT || 3001;

server.listen(PORT, () => {
  console.log(`\n⚡ Virtual Queue Service (API) đang chạy tại http://localhost:${PORT}`);
  console.log(`📡 Endpoints: /api/queue/* | Health: /health\n`);
});

const shutdown = (signal) => {
  console.log(`\n⚠️  Tín hiệu ${signal} nhận được. Đang tắt Virtual Queue Service...`);
  if (queueWorker) queueWorker.stop();
  server.close(() => {
    console.log('✅ Virtual Queue Service đã tắt.');
    process.exit(0);
  });
};

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  if (queueWorker) queueWorker.stop();
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

