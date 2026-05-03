const redis = require('../../config/redis');

// Khai báo thời gian giới hạn tuyệt đối (Hard Timeout)
// Nghĩa có thể đổi số 10 thành số phút mong muốn
const HARD_TIMEOUT_MS = 1 * 60 * 1000; // 10 phút
const processQueueLua = `
  -- Khai báo biến từ mảng KEYS và ARGV truyền vào
  local activeKey = KEYS[1]
  local listKey = KEYS[2]
  local startKey = KEYS[3]
  
  local now = tonumber(ARGV[1])
  local batchSize = tonumber(ARGV[2])
  local sessionTtlMs = tonumber(ARGV[3])

  -- 1. [DỌN DẸP] Lấy danh sách những người hết hạn và xóa họ
  local deadUsers = redis.call('ZRANGEBYSCORE', activeKey, 0, now)
  if #deadUsers > 0 then
    redis.call('ZREMRANGEBYSCORE', activeKey, 0, now)
    for i, userId in ipairs(deadUsers) do
      redis.call('HDEL', startKey, userId)
    end
  end

  -- 2. Đếm số người đang ở trong phòng
  local activeCount = redis.call('ZCARD', activeKey)
  local slotsAvailable = batchSize - activeCount

  local luckyUsers = {}

  -- 3. Nếu còn chỗ, lấy thêm người từ hàng chờ
  if slotsAvailable > 0 then
    -- ZRANGE dùng index bắt đầu từ 0, nên cần trừ đi 1
    luckyUsers = redis.call('ZRANGE', listKey, 0, slotsAvailable - 1)

    if #luckyUsers > 0 then
      local expireTime = now + sessionTtlMs
      for i, userId in ipairs(luckyUsers) do
        redis.call('ZADD', activeKey, expireTime, userId)
        redis.call('HSET', startKey, userId, now)
        redis.call('ZREM', listKey, userId)
      end
    end
  end

  -- Trả về danh sách những người vừa được đưa vào phòng
  return luckyUsers
`;
redis.defineCommand('luaProcessQueue', {
  numberOfKeys: 3,
  lua: processQueueLua,
});
const joinQueueLua = `
  local activeKey = KEYS[1]
  local listKey = KEYS[2]
  local userId = ARGV[1]
  local now = tonumber(ARGV[2])

  -- 1. Kiểm tra xem đã ở trong phòng chưa
  local expireTime = redis.call('zscore', activeKey, userId)
  if expireTime and tonumber(expireTime) > now then
    return { "allowed", 0 }
  end

  -- 2. Nếu chưa, nhét vào hàng đợi (dùng NX để giữ nguyên vị trí nếu đã ở sẵn trong đó)
  redis.call('zadd', listKey, 'NX', now, userId)

  -- 3. Lấy vị trí hiện tại
  local rank = redis.call('zrank', listKey, userId)
  if rank then
    return { "in_queue", rank + 1 }
  else
    -- Nhờ Lua là Atomic, rank chắc chắn sẽ luôn tồn tại ở bước này
    return { "in_queue", 1 } 
  end
`;
redis.defineCommand('luaJoinQueue', {
  numberOfKeys: 2,
  lua: joinQueueLua,
});
class QueueService {
  // 1. Bật/Tắt Queue
  // Trong QueueService.js
async toggleQueue(eventId, isActive) {
  if (isActive) {
    await redis.set(`queue:active:${eventId}`, "1");
    await redis.sadd('system:active_events', eventId); // Ghi danh sự kiện đang mở
  } else {
    await redis.del(`queue:active:${eventId}`);
    await redis.srem('system:active_events', eventId); // Xóa khỏi danh sách
  }
}

  // 2. Kiểm tra Queue có đang bật không
  async isQueueActive(eventId) {
    const status = await redis.get(`queue:active:${eventId}`);
    return status === "1" || status === "true";
  }

  // 3. Khách hàng xin xếp hàng (Hoặc để ping kiểm tra)
  async joinQueue(eventId, userId) {
    const now = Date.now();

    // Gọi trực tiếp hàm đã được define
    const result = await redis.luaJoinQueue(
      `queue:active_sessions:${eventId}`, // KEYS[1]
      `queue:list:${eventId}`,            // KEYS[2]
      userId,                             // ARGV[1]
      now                                 // ARGV[2]
    );

    const status = result[0];
    const position = result[1];

    if (status === 'allowed') {
      return { status: 'allowed' };
    }

    return { 
      status: 'in_queue', 
      position: position 
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
    const sessionTtlMs = ttlSeconds * 1000;

    try {
      // Gọi lệnh Custom Lua đã định nghĩa ở trên
      // Tham số truyền vào đúng thứ tự: 3 key trước, sau đó là 3 giá trị biến
      const luckyUsers = await redis.luaProcessQueue(
        activeKey,    // KEYS[1]
        listKey,      // KEYS[2]
        startKey,     // KEYS[3]
        now,          // ARGV[1]
        batchSize,    // ARGV[2]
        sessionTtlMs  // ARGV[3]
      );

      // Hàm luôn trả về mảng, nếu không có ai thì mảng rỗng []
      if (luckyUsers.length > 0) {
        console.log(`[Queue Worker] Đã đón ${luckyUsers.length} người vào phòng chọn ghế.`);
      }

      return luckyUsers;
    } catch (error) {
      console.error(`❌ [Queue Worker] Lỗi khi chạy Lua Script:`, error);
      return [];
    }
  }
}

module.exports = new QueueService();