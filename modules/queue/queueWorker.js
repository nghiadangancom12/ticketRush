const redis = require('../../config/redis');
const queueService = require('./queueService'); // Import QueueService đã tối ưu

// Tùy chỉnh thông số hệ thống
const BATCH_SIZE = 50; 
const SESSION_TTL_MINUTES = 15; 

class QueueWorker {
  constructor() {
    this.intervalId = null;
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
    // 1. Vẫn dùng .keys('queue:active:*') để tìm các event đang bật queue
    // Lệnh này chấp nhận được vì số lượng Event đang diễn ra (N) thường rất nhỏ (vài chục), không phải hàng triệu như User.
    const activeKeys = await redis.keys('queue:active:*');
    
    for (const key of activeKeys) {
      // Lấy ra eventId (Ví dụ: từ "queue:active:123" -> "123")
      const eventId = key.split(':')[2];

      // 2. GỌI HÀM XỬ LÝ SIÊU TỐC TỪ QUEUE SERVICE
      // Mọi logic đếm người (ZCARD), đuổi người (ZREMRANGEBYSCORE), lùa người (ZRANGE + Pipeline) đều được xử lý an toàn trong này.
      const releasedCount = await queueService.processQueue(eventId, BATCH_SIZE, SESSION_TTL_MINUTES);
      
      if (releasedCount > 0) {
         console.log(`[QueueWorker] Sự kiện ${eventId}: Đã thả ${releasedCount} người vào mua vé.`);
      }
    }
  }
}

module.exports = new QueueWorker();