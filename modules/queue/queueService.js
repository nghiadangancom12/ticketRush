const redis = require('../../config/redis');

// Khai báo thời gian giới hạn tuyệt đối (Hard Timeout)
// Nghĩa có thể đổi số 10 thành số phút mong muốn
const HARD_TIMEOUT_MS = 1 * 60 * 1000; // 10 phút

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
    return status === "1" || status === "true";
  }

  // 3. Khách hàng xin xếp hàng (Hoặc để ping kiểm tra)
  async joinQueue(eventId, userId) {
    const now = Date.now();

    const expireTime = await redis.zscore(`queue:active_sessions:${eventId}`, userId);
    if (expireTime && parseInt(expireTime) > now) {
      return { status: 'allowed' };
    }

    await redis.zadd(`queue:list:${eventId}`, 'NX', now, userId);

    const rank = await redis.zrank(`queue:list:${eventId}`, userId);
    return {
      status: 'in_queue',
      position: rank !== null ? rank + 1 : 1
    };
  }

  async hasActiveSession(eventId, userId) {
    const expireTime = await redis.zscore(`queue:active_sessions:${eventId}`, userId);
    return expireTime && parseInt(expireTime) > Date.now();
  }

  // 4. Khách hàng chủ động hủy xếp hàng (Hoặc thanh toán xong nhường chỗ sớm)
  async removeAllowed(eventId, userId) {
    const pipeline = redis.pipeline();
    pipeline.zrem(`queue:list:${eventId}`, userId);
    pipeline.zrem(`queue:active_sessions:${eventId}`, userId);
    // [NEW] Xóa mốc thời gian bắt đầu để dọn dẹp RAM
    pipeline.hdel(`queue:session_starts:${eventId}`, userId); 
    await pipeline.exec();
  }

  // 5. Heartbeat — "Khóa kép": Gia hạn 20s nhưng chém đẹp nếu quá 10 phút
  async heartbeat(eventId, userId) {
    const now = Date.now();
    const activeKey = `queue:active_sessions:${eventId}`;
    const startKey = `queue:session_starts:${eventId}`;

    // 5.1. CHECK HEARTBEAT: Kiểm tra user có đang trong phòng active không
    const currentExpiry = await redis.zscore(activeKey, userId);
    if (!currentExpiry || parseInt(currentExpiry) <= now) {
      return { alive: false, reason: 'DISCONNECTED' }; // Đã rớt mạng quá 20s
    }

    // 5.2. CHECK HARD LIMIT: Lấy giờ vào phòng để xem đã ngâm ghế quá 10 phút chưa?
    const startTime = await redis.hget(startKey, userId);
    if (startTime && (now - parseInt(startTime) > HARD_TIMEOUT_MS)) {
      console.log(`[Queue] ⏰ User ${userId} đã hết hạn 10 phút, kích xuất!`);
      // Chủ động dọn dẹp luôn trong Redis
      await this.removeAllowed(eventId, userId);
      return { alive: false, reason: 'TIMEOUT' }; 
    }

    // 5.3. Vượt qua 2 vòng kiểm tra -> Gia hạn Heartbeat thêm 20 giây
    const TTL_MS = 20 * 1000;
    await redis.zadd(activeKey, now + TTL_MS, userId);
    
    // Tính toán thời gian còn lại của 10 phút để trả về (hỗ trợ Frontend làm đồng hồ đếm ngược)
    const timeLeft = startTime ? HARD_TIMEOUT_MS - (now - parseInt(startTime)) : 0;

    return { 
      alive: true, 
      expiresAt: now + TTL_MS,
      hardTimeoutLeft: timeLeft > 0 ? timeLeft : 0 // Trả về số mili-giây còn lại
    };
  }

  // ==========================================
  // CÁC HÀM DÀNH RIÊNG CHO WORKER (GATEKEEPER)
  // ==========================================

  async processQueue(eventId, batchSize = 2, ttlSeconds = 20) {
    const now = Date.now();
    const activeKey = `queue:active_sessions:${eventId}`;
    const listKey = `queue:list:${eventId}`;
    const startKey = `queue:session_starts:${eventId}`;
    const sessionTtl = ttlSeconds * 1000; 

    // 1. [NEW] Lấy danh sách những người rớt mạng (hết TTL) để dọn dẹp cả bảng Start Time
    const deadUsers = await redis.zrangebyscore(activeKey, 0, now);
    if (deadUsers.length > 0) {
      const cleanPipeline = redis.pipeline();
      cleanPipeline.zremrangebyscore(activeKey, 0, now); // Đuổi khỏi phòng
      deadUsers.forEach(userId => {
        cleanPipeline.hdel(startKey, userId); // Xóa rác ở bảng Start Time
      });
      await cleanPipeline.exec();
    }

    // 2. Đếm số người ĐANG Ở TRONG PHÒNG
    const activeCount = await redis.zcard(activeKey);

    // 3. Mở cửa đón thêm
    if (activeCount < batchSize) {
      const slotsAvailable = batchSize - activeCount;
      const luckyUsers = await redis.zrange(listKey, 0, slotsAvailable - 1);

      if (luckyUsers.length > 0) {
        const pipeline = redis.pipeline();
        luckyUsers.forEach(userId => {
          pipeline.zadd(activeKey, now + sessionTtl, userId); // Cấp thẻ bài 20s
          pipeline.hset(startKey, userId, now); // [NEW] Ghi danh giờ vào phòng
          pipeline.zrem(listKey, userId); // Xóa khỏi hàng chờ
        });
        await pipeline.exec();
        
        return luckyUsers;
      }
    }
    return 0;
  }
}

module.exports = new QueueService();