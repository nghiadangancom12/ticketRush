const redis = require('../../../config/redis');
const queueService = require('../../queue/queueService');

const BATCH_SIZE = 2;
const SESSION_TTL_SECONDS = 20; 

// [NEW] Khai báo thời gian Hard Timeout giống bên QueueService
const HARD_TIMEOUT_MINUTES = 1; 

class QueueWorker {
  constructor() {
    this.intervalId = null;
    this.io = null;
  }

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
    const activeKeys = await redis.keys('queue:active:*');
    
    for (const key of activeKeys) {
      const eventId = key.split(':')[2];

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