require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const express = require('express');
const redisSubscriber = require('../shared/config/redisSubscriber');
const { EVENTS } = require('../shared/config/eventCatalog');

const app = express();

app.get('/health', (req, res) =>
  res.status(200).json({ status: 'ok', service: 'socket-gateway' })
);

const server = http.createServer(app);
const PORT = process.env.SOCKET_PORT || 3002;

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// ─── Redis Pub/Sub: Nhận events từ queue-worker và các services khác ─────────
// Thay thế direct import queueWorker — decoupled hoàn toàn qua Redis Pub/Sub
redisSubscriber.subscribe(
  EVENTS.QUEUE_TURN,
  EVENTS.SEAT_STATUS_CHANGED,
  EVENTS.SEAT_HOLD_EXPIRED,
  (err, count) => {
    if (err) {
      console.error('[Socket Gateway] Subscribe Redis events thất bại:', err.message);
    } else {
      console.log(`[Socket Gateway] 🔔 Đang lắng nghe ${count} kênh Redis Pub/Sub`);
    }
  }
);

redisSubscriber.on('message', (channel, message) => {
  try {
    const payload = JSON.parse(message);

    if (channel === EVENTS.QUEUE_TURN) {
      // Phát thông báo đến phòng của user cụ thể
      const { userId } = payload;
      if (userId) {
        io.to(userId.toString()).emit('queue_turn', payload);
      }
    }

    if (channel === EVENTS.SEAT_STATUS_CHANGED) {
      // Broadcast đến phòng của event
      const { eventId } = payload;
      if (eventId) {
        io.to(`event_${eventId}`).emit('seat_status_changed', payload);
      }
    }

    if (channel === EVENTS.SEAT_HOLD_EXPIRED) {
      // Phát thông báo hết hạn giữ ghế đến user
      const { userId } = payload;
      if (userId) {
        io.to(userId.toString()).emit('seat_hold_expired', payload);
      }
    }
  } catch (err) {
    console.error('[Socket Gateway] Lỗi parse Redis message:', err.message);
  }
});

// ─── Socket.io: Xử lý kết nối client ─────────────────────────────────────────
io.on('connection', (socket) => {
  socket.on('joinEventRoom', (eventId) => {
    socket.join(`event_${eventId}`);
  });

  socket.on('joinUserRoom', (userId) => {
    socket.join(userId.toString());
  });

  socket.on('disconnect', () => {
    // Cleanup tự động bởi Socket.io
  });
});

server.listen(PORT, () => {
  console.log('\n[Socket Gateway Service] Socket.io Server đang lắng nghe');
  console.log(`[Socket Gateway Service] PORT: ${PORT}`);
  console.log(`[Socket Gateway Service] Health: /health\n`);
});

const shutdown = (signal) => {
  console.log(`\nTín hiệu ${signal} nhận được. Đang tắt Socket Gateway Service...`);
  redisSubscriber.unsubscribe();
  server.close(() => {
    console.log('Socket Gateway Service đã tắt.');
    process.exit(0);
  });
};

process.on('unhandledRejection', (err) => {
  console.error('[Socket Gateway] Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
