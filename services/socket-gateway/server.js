require('dotenv').config();
const http = require('http');
const express = require('express');
const { Server: SocketIOServer } = require('socket.io');
const redisSubscriber = require('../../config/redisSubscriber');
const { EVENTS } = require('../../config/eventCatalog');

const app = express();
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', service: 'realtime-socket-gateway' }));

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log(`🔌 [Socket Gateway] Client kết nối: ${socket.id}`);

  // Join phòng theo sự kiện (ví dụ: nhận thông tin cập nhật trạng thái ghế)
  socket.on('joinEventRoom', (eventId) => {
    socket.join(`event_${eventId}`);
    console.log(`📡 [Socket Gateway] Socket ${socket.id} đã vào phòng event_${eventId}`);
  });

  // Join phòng cá nhân của user (để nhận thông báo đến lượt từ Virtual Queue & Hết giờ giữ ghế)
  socket.on('join_queue', (userId) => {
    if (userId) {
      socket.join(userId.toString());
      console.log(`🧍 [Socket Gateway] Socket ${socket.id} (User: ${userId}) sẵn sàng nhận thông báo Queue/Hold.`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 [Socket Gateway] Client ngắt kết nối: ${socket.id}`);
  });
});

// 🔔 Subcribe các kênh Redis Pub/Sub theo Event Catalog Contract
const redisEnabled = process.env.DISABLE_REDIS !== 'true';
if (redisEnabled) {
  redisSubscriber.subscribe(EVENTS.SEAT_STATUS_CHANGED, EVENTS.QUEUE_TURN, EVENTS.SEAT_HOLD_EXPIRED, (err, count) => {
    if (err) {
      console.error('❌ [Socket Gateway] Subscribe Redis thất bại:', err.message);
    } else {
      console.log(`🔔 [Socket Gateway] Đang lắng nghe ${count} kênh Redis Pub/Sub (${EVENTS.SEAT_STATUS_CHANGED}, ${EVENTS.QUEUE_TURN}, ${EVENTS.SEAT_HOLD_EXPIRED})...`);
    }
  });

  redisSubscriber.on('message', (channel, message) => {
    try {
      const payload = JSON.parse(message);

      if (channel === EVENTS.SEAT_STATUS_CHANGED) {
        io.to(`event_${payload.eventId}`).emit('seatStatusChanged', payload);
        console.log(`[Socket Gateway] 📡 Seat status broadcast cho event_${payload.eventId}:`, payload.seats);
      } else if (channel === EVENTS.QUEUE_TURN) {
        io.to(payload.userId.toString()).emit('queue_turn', payload);
        console.log(`[Socket Gateway] 🧍 Queue turn notification tới user:${payload.userId}`);
      } else if (channel === EVENTS.SEAT_HOLD_EXPIRED) {
        io.to(payload.userId.toString()).emit('seatHoldExpired', payload);
        console.log(`[Socket Gateway] ⏰ Seat hold expired notification tới user:${payload.userId}`);
      }
    } catch (err) {
      console.error('[Socket Gateway] ❌ Lỗi parse tin nhắn Pub/Sub:', err.message);
    }
  });
} else {
  console.log('⚠️ [Socket Gateway] Redis bị tắt bằng DISABLE_REDIS=true');
}

const PORT = process.env.SOCKET_PORT || 3002;
server.listen(PORT, () => {
  console.log(`\n🚀 Real-time Socket Gateway đang chạy tại http://localhost:${PORT}`);
  console.log(`📡 WebSocket ready | Health: /health\n`);
});

const shutdown = (signal) => {
  console.log(`\n⚠️  Tín hiệu ${signal} nhận được. Đang tắt Socket Gateway...`);
  server.close(() => {
    console.log('✅ Real-time Socket Gateway đã tắt.');
    process.exit(0);
  });
};

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
