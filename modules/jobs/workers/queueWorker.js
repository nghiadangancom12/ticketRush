const redis = require('../../../config/redis');
const queueService = require('../../queue/queueService');

const BATCH_SIZE = 2;
const SESSION_TTL_SECONDS = 20; 

// [NEW] Khai báo thời gian Hard Timeout giống bên QueueService
const HARD_TIMEOUT_MINUTES = 1; 

class QueueWorker {
 constructor() {
    this.timeoutId = null;
    this.io = null;
    this.isRunning = false; // Thêm cờ trạng thái
  }

  setIO(io) {
    this.io = io;
    console.log('[QueueWorker] Đã nhận kết nối Socket.io thành công!');
  }

  start() {
    this.isRunning = true;
    this.loop(); // Bắt đầu vòng lặp
    console.log('🚀 Background QueueWorker started! Giám sát an toàn với setTimeout.');
  }

  stop() {
    this.isRunning = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      console.log('🛑 QueueWorker stopped.');
    }
  }

  // Tạo một hàm loop() riêng biệt
  async loop() {
    if (!this.isRunning) return; // Dừng lại nếu đã gọi hàm stop()

    try {
      await this.run(); // Đợi hàm run() xử lý xong HOÀN TOÀN
    } catch (err) {
      console.error('QueueWorker Error:', err);
    } finally {
      // Dù thành công hay thất bại, đợi thêm 5 giây rồi mới chạy lại
      if (this.isRunning) {
        this.timeoutId = setTimeout(() => this.loop(), 5000);
      }
    }
  }

  async run() {
    const activeEventIds = await redis.smembers('system:active_events');
    
    for (const eventId of activeEventIds) {
      const luckyUsers = await queueService.processQueue(eventId, BATCH_SIZE, SESSION_TTL_SECONDS);
      
      if (luckyUsers && Array.isArray(luckyUsers) && luckyUsers.length > 0) {
         console.log(`[QueueWorker] Sự kiện ${eventId}: Đã thả ${luckyUsers.length} người vào mua vé.`);
         
         if (this.io) {
            // [SỬA ĐOẠN NÀY]: Tính thời gian Hard Timeout (10 phút) để Frontend hiển thị đồng hồ
            const hardExpireAt = Date.now() + (HARD_TIMEOUT_MINUTES * 60 * 1000);

            luckyUsers.forEach(userId => {
              this.io.to(userId).emit('queue_turn', {
                status: 'YOUR_TURN',
                message: `Đã đến lượt bạn! Bạn có ${HARD_TIMEOUT_MINUTES} phút để hoàn tất chọn ghế.`,
                expireAt: hardExpireAt, // Báo cho Frontend biết giới hạn cuối cùng
                hardTimeoutMinutes: HARD_TIMEOUT_MINUTES // Trả thêm số phút để Frontend dễ format
              });
            });
         }
      }
    }
  }
}

module.exports = new QueueWorker();