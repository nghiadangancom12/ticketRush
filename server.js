require('dotenv').config();
const http = require('http');
const { Server: SocketIOServer } = require('socket.io');
const app = require('./app');

// ─── Khởi động BullMQ Workers ─────────────────────────────────────────────
// Import workers để chúng tự động kết nối Redis và bắt đầu lắng nghe jobs.
require('./modules/jobs/workers/seatReleaseWorker');
require('./modules/jobs/workers/emailWorker');

// 👇 1. IMPORT QUEUE WORKER MỚI
const queueWorker = require('./modules/jobs/workers/queueWorker');

// ─── HTTP Server + Socket.IO ───────────────────────────────────────────────
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Gắn io vào app để các controller truy cập được
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`🔌 Socket kết nối: ${socket.id}`);

  // Client join vào "phòng" của một event để nhận update ghế real-time
  socket.on('joinEventRoom', (eventId) => {
    socket.join(`event_${eventId}`);
    console.log(`📡 Socket ${socket.id} đã vào phòng event_${eventId}`);
  });

  // 👇 2. BỔ SUNG: Client đăng ký phòng riêng (bằng userId) để nhận thông báo tới lượt
  socket.on('join_queue', (userId) => {
    socket.join(userId.toString());
    console.log(`🧍 Socket ${socket.id} (User: ${userId}) đã sẵn sàng nhận thông báo Queue.`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket ngắt kết nối: ${socket.id}`);
  });
});

// 👇 3. BƠM KẾT NỐI SOCKET VÀ KHỞI ĐỘNG QUEUE WORKER
queueWorker.setIO(io);
queueWorker.start();

// ─── Start Server ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🚀 TicketRush server đang chạy tại http://localhost:${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
  console.log(`⚡ BullMQ Workers: seatReleaseWorker + emailWorker (concurrency: 4) đã khởi động`);
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