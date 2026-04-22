const redis = require('../../config/redis');
const queueService = require('./queueService'); // Import QueueService đã tối ưu

// Tùy chỉnh thông số hệ thống
const BATCH_SIZE = 50; 
const SESSION_TTL_MINUTES = 15; 

class QueueWorker {
  constructor() {
    this.intervalId = null;
    this.io = null; // Khởi tạo biến io trống
  }

  // Hàm để server.js truyền io vào
  setIO(io) {
    this.io = io;
    console.log('[QueueWorker] Đã nhận kết nối Socket.io thành công!');
  }

  start() {
    this.intervalId = setInterval(async () => {
      try {
        await this.run();
      } catch (err) {
        console.error('QueueWorker Error:', err);
      }
    }, 5000);
    console.log('🚀 Background QueueWorker started! Giám sát mỗi 5 giây.');
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      console.log('🛑 QueueWorker stopped.');
    }
  }

  async run() {
    // 1. Tìm các event đang bật queue
    const activeKeys = await redis.keys('queue:active:*');
    
    for (const key of activeKeys) {
      // Lấy ra eventId (Ví dụ: từ "queue:active:123" -> "123")
      const eventId = key.split(':')[2];

      // 2. GỌI HÀM XỬ LÝ SIÊU TỐC TỪ QUEUE SERVICE
      // LƯU Ý QUAN TRỌNG: Đảm bảo queueService trả về mảng các userId (luckyUsers)
      const luckyUsers = await queueService.processQueue(eventId, BATCH_SIZE, SESSION_TTL_MINUTES);
      
      // Kiểm tra nếu có mảng trả về và mảng đó có phần tử
      if (luckyUsers && Array.isArray(luckyUsers) && luckyUsers.length > 0) {
         console.log(`[QueueWorker] Sự kiện ${eventId}: Đã thả ${luckyUsers.length} người vào mua vé.`);
         
         // ==========================================
         // 3. BẮN THÔNG BÁO WEBSOCKET ĐẾN TỪNG NGƯỜI
         // ==========================================
         if (this.io) {
            // Lấy thời gian hết hạn để gửi cho Frontend làm đồng hồ đếm ngược
            const expireAt = Date.now() + (SESSION_TTL_MINUTES * 60 * 1000);

            luckyUsers.forEach(userId => {
              this.io.to(userId).emit('queue_turn', {
                status: 'YOUR_TURN',
                message: 'Đã đến lượt bạn! Hãy tiến hành chọn ghế.',
                expireAt: expireAt
              });
            });
         }
      }
    }
  }
}

module.exports = new QueueWorker();