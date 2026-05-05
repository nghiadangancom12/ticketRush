require('dotenv').config();
const http = require('http');
const app = require('./app');

// Import Workers
require('./modules/jobs/workers/seatReleaseWorker');
require('./modules/jobs/workers/emailWorker');
const queueWorker = require('./modules/jobs/workers/queueWorker');

// Import Socket Handler
const initializeSocket = require('./modules/socket/socketHandler');

// ─── HTTP Server ───────────────────────────────────────────────
const server = http.createServer(app);

// ─── Khởi tạo Socket.IO ──────────────────────────────────────────
// Chỉ cần 1 dòng này là toàn bộ logic socket được thiết lập
const io = initializeSocket(server);

// Gắn io vào app để controller dùng
app.set('io', io);

// ─── Khởi động Queue Worker ──────────────────────────────────────
queueWorker.setIO(io);
queueWorker.start();

// ─── Start Server & Graceful Shutdown ──────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🚀 TicketRush server đang chạy tại http://localhost:${PORT}`);
  console.log(`🛡️  Virtual Queue Worker đã được kích hoạt!\n`);
});
// ─── Graceful Shutdown ─────────────────────────────────────────────────────
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  // 👇 4. Tắt Queue Worker trước khi sập server
  queueWorker.stop(); 
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM nhận được. Đang tắt server...');
  // 👇 4. Tắt Queue Worker trước khi tắt server
  queueWorker.stop();
  server.close(() => {
    console.log('✅ Server đã tắt.');
    process.exit(0);
  });
});