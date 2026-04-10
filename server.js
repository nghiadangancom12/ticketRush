process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const cron = require('node-cron');
const prisma = require('./config/database');
const app = require('./app');

const server = http.createServer(app);
const io = new Server(server, {
  cors: { 
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST']
  },
});

// Gán io vào app để các route modules có thể lấy từ req.app.get('io')
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// Cron Job: Chạy mỗi 1 phút để test (giải phóng ghế LOCKED > 1 phút)
cron.schedule('* * * * *', async () => {
  try {
    const oneMinuteAgo = new Date(Date.now() - 60000); 
    const expiredSeats = await prisma.seats.findMany({
      where: { status: 'LOCKED', locked_at: { lt: oneMinuteAgo } }
    });

    if (expiredSeats.length > 0) {
      console.log(`[Cron] Found ${expiredSeats.length} expired locked seats. Releasing...`);
      const idsToRelease = expiredSeats.map(s => s.id);
      await prisma.seats.updateMany({
        where: { id: { in: idsToRelease } },
        data: { status: 'AVAILABLE', locked_by: null, locked_at: null }
      });
      io.emit('seatUpdated', { releasedSeats: idsToRelease }); 
    }
  } catch (err) {
    console.error('[Cron] Error releasing empty seats:', err);
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
