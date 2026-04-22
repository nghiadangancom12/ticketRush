const redis = require('../../config/redis');

class QueueService {
  // 1. Bật/Tắt Queue
  async toggleQueue(eventId, isActive) {
    if (isActive) {
      await redis.set(`queue:active:${eventId}`, "1");
    } else {
      await redis.del(`queue:active:${eventId}`);
    }
    return { eventId, isActive };
  }

  // 2. Kiểm tra Queue có đang bật không
async isQueueActive(eventId) {
  const status = await redis.get(`queue:active:${eventId}`);
  
  // Nâng cấp: Chấp nhận cả chuỗi "1" và chuỗi "true" (đề phòng gõ nhầm trên Upstash)
  return status === "1" || status === "true";
}

  // 3. Khách hàng xin xếp hàng (Hoặc để ping kiểm tra)
  async joinQueue(eventId, userId) {
    const now = Date.now();

    // Bước 1: Check xem có đang trong phòng Active không và thẻ có còn hạn không?
    const expireTime = await redis.zscore(`queue:active_sessions:${eventId}`, userId);
    if (expireTime && parseInt(expireTime) > now) {
      return { status: 'allowed' };
    }

    // Bước 2: Thêm vào hàng đợi (Cờ NX giữ nguyên vị trí nếu spam)
    await redis.zadd(`queue:list:${eventId}`, 'NX', now, userId);

    // Bước 3: Trả về Rank
    const rank = await redis.zrank(`queue:list:${eventId}`, userId);
    return {
      status: 'in_queue',
      position: rank !== null ? rank + 1 : 1
    };
  }
  // Thêm vào bên trong class QueueService
  async hasActiveSession(eventId, userId) {
    const expireTime = await redis.zscore(`queue:active_sessions:${eventId}`, userId);
    return expireTime && parseInt(expireTime) > Date.now();
  }
  // 4. Khách hàng chủ động hủy xếp hàng (Hoặc thanh toán xong nhường chỗ sớm)
  async removeAllowed(eventId, userId) {
    // Xóa ở cả 2 phòng cho chắc chắn
    await redis.zrem(`queue:list:${eventId}`, userId);
    await redis.zrem(`queue:active_sessions:${eventId}`, userId);
  }

  // ==========================================
  // CÁC HÀM DÀNH RIÊNG CHO WORKER (GATEKEEPER)
  // ==========================================

  // Hàm lùa người từ Hàng Đợi -> Phòng Active
  async processQueue(eventId, batchSize = 50, ttlMinutes = 15) {
    const now = Date.now();
    const activeKey = `queue:active_sessions:${eventId}`;
    const listKey = `queue:list:${eventId}`;
    const sessionTtl = ttlMinutes * 60 * 1000; 

    // 1. Đuổi những người hết hạn ra khỏi phòng Active (O(log(N)))
    await redis.zremrangebyscore(activeKey, 0, now);

    // 2. Đếm số người ĐANG Ở TRONG PHÒNG (Dùng zcard siêu nhanh - O(1))
    const activeCount = await redis.zcard(activeKey);

    // 3. Mở cửa đón thêm
    if (activeCount < batchSize) {
      const slotsAvailable = batchSize - activeCount;
      
      // Lấy N người đứng đầu hàng đợi
      const luckyUsers = await redis.zrange(listKey, 0, slotsAvailable - 1);

      if (luckyUsers.length > 0) {
        const pipeline = redis.pipeline();
        luckyUsers.forEach(userId => {
          pipeline.zadd(activeKey, now + sessionTtl, userId); // Cấp thẻ bài
          pipeline.zrem(listKey, userId); // Xóa khỏi hàng chờ
        });
        await pipeline.exec();
        
        return luckyUsers; // Trả về số người vừa được thả
      }
    }
    return 0; // Không thả ai
  }
}

module.exports = new QueueService();