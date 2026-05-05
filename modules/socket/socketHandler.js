// file: modules/socket/socketHandler.js
const { Server: SocketIOServer } = require('socket.io');

const initializeSocket = (server) => {
  // 1. Khởi tạo io
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // 2. Định nghĩa các sự kiện
  io.on('connection', (socket) => {
    console.log(`🔌 Socket kết nối: ${socket.id}`);

    socket.on('joinEventRoom', (eventId) => {
      socket.join(`event_${eventId}`);
      console.log(`📡 Socket ${socket.id} đã vào phòng event_${eventId}`);
    });

    socket.on('join_queue', (userId) => {
      socket.join(userId.toString());
      console.log(`🧍 Socket ${socket.id} (User: ${userId}) đã sẵn sàng nhận thông báo Queue.`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket ngắt kết nối: ${socket.id}`);
    });
  });

  // 3. Trả về đối tượng io để server.js sử dụng tiếp
  return io;
};

module.exports = initializeSocket;