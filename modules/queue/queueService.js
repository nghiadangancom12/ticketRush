const redis = require('../../config/redis');

// Khai báo các mốc thời gian (Tính bằng mili-giây)
const QUEUE_TTL_MS = Number(process.env.QUEUE_TTL_MS || 20_000); // 20s cho người trong phòng
const QUEUE_HARD_TIMEOUT_MS = Number(process.env.QUEUE_HARD_TIMEOUT_MS || 10 * 60 * 1000); // 10 phút tối đa
const WAITING_TIMEOUT_MS = Number(process.env.WAITING_TIMEOUT_MS || 15_000); // [NEW] 15s cho người đang xếp hàng

const processQueueLua = `
  -- KEYS[1]: activeKey, KEYS[2]: listKey, KEYS[3]: startKey, KEYS[4]: waitingHeartbeatKey [NEW]
  local activeKey = KEYS[1]
  local listKey = KEYS[2]
  local startKey = KEYS[3]
  local waitingHeartbeatKey = KEYS[4] 
  
  local now = tonumber(ARGV[1])
  local batchSize = tonumber(ARGV[2])
  local sessionTtlMs = tonumber(ARGV[3])

  -- 1. [DỌN DẸP ACTIVE] Lấy danh sách những người hết hạn trong phòng và xóa
  local deadUsers = redis.call('ZRANGEBYSCORE', activeKey, 0, now)
  if #deadUsers > 0 then
    redis.call('ZREMRANGEBYSCORE', activeKey, 0, now)
    for i, userId in ipairs(deadUsers) do
      redis.call('HDEL', startKey, userId)
    end
  end

  -- 2. [NEW] [DỌN DẸP WAITING] Xóa những người xếp hàng nhưng đã thoát trang (quá 15s ko gọi joinQueue)
  local deadWaiters = redis.call('ZRANGEBYSCORE', waitingHeartbeatKey, 0, now)
  if #deadWaiters > 0 then
    redis.call('ZREMRANGEBYSCORE', waitingHeartbeatKey, 0, now) -- Xóa nhịp tim chờ
    for i, userId in ipairs(deadWaiters) do
      redis.call('ZREM', listKey, userId) -- Xóa khỏi hàng đợi chính
    end
  end

  -- 3. Đếm số người đang ở trong phòng
  local activeCount = redis.call('ZCARD', activeKey)
  local slotsAvailable = batchSize - activeCount

  local luckyUsers = {}

  -- 4. Nếu còn chỗ, lấy thêm người từ hàng chờ
  if slotsAvailable > 0 then
    -- ZRANGE dùng index bắt đầu từ 0, nên cần trừ đi 1
    luckyUsers = redis.call('ZRANGE', listKey, 0, slotsAvailable - 1)

    if #luckyUsers > 0 then
      local expireTime = now + sessionTtlMs
      for i, userId in ipairs(luckyUsers) do
        redis.call('ZADD', activeKey, expireTime, userId)
        redis.call('HSET', startKey, userId, now)
        redis.call('ZREM', listKey, userId)
        redis.call('ZREM', waitingHeartbeatKey, userId) -- [NEW] Đã vào phòng thì không cần nhịp tim chờ nữa
      end
    end
  end

  -- Trả về danh sách những người vừa được đưa vào phòng
  return luckyUsers
`;
redis.defineCommand('luaProcessQueue', {
  numberOfKeys: 4, // [NEW] Tăng lên 4 key
  lua: processQueueLua,
});

const joinQueueLua = `
  -- KEYS[1]: activeKey, KEYS[2]: listKey, KEYS[3]: waitingHeartbeatKey [NEW]
  local activeKey = KEYS[1]
  local listKey = KEYS[2]
  local waitingHeartbeatKey = KEYS[3]

  local userId = ARGV[1]
  local now = tonumber(ARGV[2])
  local waitingTimeoutMs = tonumber(ARGV[3]) -- [NEW]

  -- 1. Kiểm tra xem đã ở trong phòng chưa
  local expireTime = redis.call('zscore', activeKey, userId)
  if expireTime and tonumber(expireTime) > now then
    return { "allowed", 0 }
  end

  -- 2. [NEW] Cập nhật nhịp tim cho người ĐANG CHỜ (Hạn sống = now + 15s)
  redis.call('zadd', waitingHeartbeatKey, now + waitingTimeoutMs, userId)

  -- 3. Nhét vào hàng đợi (dùng NX để giữ nguyên vị trí nếu đã ở sẵn trong đó)
  redis.call('zadd', listKey, 'NX', now, userId)

  -- 4. Lấy vị trí hiện tại
  local rank = redis.call('zrank', listKey, userId)
  if rank then
    return { "in_queue", rank + 1 }
  else
    -- Nhờ Lua là Atomic, rank chắc chắn sẽ luôn tồn tại ở bước này
    return { "in_queue", 1 } 
  end
`;
redis.defineCommand('luaJoinQueue', {
  numberOfKeys: 3, // [NEW] Tăng lên 3 key
  lua: joinQueueLua,
});

const heartbeatLua = `
  local activeKey = KEYS[1]
  local startKey  = KEYS[2]
  local listKey   = KEYS[3] 

  local userId = ARGV[1]
  local now = tonumber(ARGV[2])
  local ttlMs = tonumber(ARGV[3])
  local hardTimeoutMs = tonumber(ARGV[4])

  -- 5.1. CHECK HEARTBEAT
  local currentExpiry = redis.call('zscore', activeKey, userId)
  if not currentExpiry or tonumber(currentExpiry) <= now then
      return { "DISCONNECTED", 0 }
  end

  -- 5.2. CHECK HARD LIMIT
  local startTime = redis.call('hget', startKey, userId)
  if not startTime then
      redis.call('zrem', activeKey, userId)
      return { "DISCONNECTED", 0 }
  end

  local timeElapsed = now - tonumber(startTime)
  if timeElapsed > hardTimeoutMs then
      redis.call('zrem', activeKey, userId)
      redis.call('hdel', startKey, userId)
      redis.call('zrem', listKey, userId)
      return { "TIMEOUT", 0 }
  end

  -- 5.3. GIA HẠN THÀNH CÔNG
  redis.call('zadd', activeKey, now + ttlMs, userId)
  
  local timeLeft = hardTimeoutMs - timeElapsed
  return { "ALIVE", timeLeft }
`;

redis.defineCommand('luaHeartbeat', {
  numberOfKeys: 3,
  lua: heartbeatLua,
});

class QueueService {
  // 1. Bật/Tắt Queue
  async toggleQueue(eventId, isActive) {
    if (isActive) {
      await redis.set(`queue:active:${eventId}`, "1");
      await redis.sadd('system:active_events', eventId);
    } else {
      await redis.del(`queue:active:${eventId}`);
      await redis.srem('system:active_events', eventId);
    }
  }

  // 2. Kiểm tra Queue có đang bật không
  async isQueueActive(eventId) {
    const status = await redis.get(`queue:active:${eventId}`);
    return status === "1" || status === "true";
  }

  // 3. Khách hàng xin xếp hàng (Và kiêm luôn gửi nhịp tim lúc chờ)
  async joinQueue(eventId, userId) {
    const now = Date.now();

    const result = await redis.luaJoinQueue(
      `queue:active_sessions:${eventId}`,   // KEYS[1]
      `queue:list:${eventId}`,              // KEYS[2]
      `queue:waiting_heartbeat:${eventId}`, // KEYS[3] [NEW] Truyền key nhịp tim chờ
      userId,                               // ARGV[1]
      now,                                  // ARGV[2]
      WAITING_TIMEOUT_MS                    // ARGV[3] [NEW] Timeout 15s
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

  // 4. Khách hàng chủ động hủy xếp hàng hoặc dọn dẹp sau thanh toán
  async removeAllowed(eventId, userId) {
    const pipeline = redis.pipeline();
    pipeline.zrem(`queue:list:${eventId}`, userId);
    pipeline.zrem(`queue:active_sessions:${eventId}`, userId);
    pipeline.hdel(`queue:session_starts:${eventId}`, userId); 
    pipeline.zrem(`queue:waiting_heartbeat:${eventId}`, userId); // [NEW] Dọn luôn rác ở waiting list
    await pipeline.exec();
  }

  // 5. Heartbeat (Dành cho người ĐÃ VÀO PHÒNG chọn ghế)
  async heartbeat(eventId, userId) {
    const now = Date.now();
    const result = await redis.luaHeartbeat(
      `queue:active_sessions:${eventId}`, // KEYS[1]
      `queue:session_starts:${eventId}`,  // KEYS[2]
      `queue:list:${eventId}`,            // KEYS[3]
      userId,                             // ARGV[1]
      now,                                // ARGV[2]
      QUEUE_TTL_MS,                       // ARGV[3]
      QUEUE_HARD_TIMEOUT_MS               // ARGV[4]
    );

    const status = result[0];
    const timeLeft = result[1];

    if (status === 'DISCONNECTED') {
        return { alive: false, reason: 'DISCONNECTED' };
    }
    if (status === 'TIMEOUT') {
        console.log(`[Queue] ⏰ User ${userId} đã hết hạn 10 phút, kích xuất!`);
        return { alive: false, reason: 'TIMEOUT' };
    }
    
    return { 
        alive: true, 
        expiresAt: now + QUEUE_TTL_MS,
        hardTimeoutLeft: timeLeft
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
    const waitingHeartbeatKey = `queue:waiting_heartbeat:${eventId}`; // [NEW]
    const sessionTtlMs = ttlSeconds * 1000;

    try {
      const luckyUsers = await redis.luaProcessQueue(
        activeKey,            // KEYS[1]
        listKey,              // KEYS[2]
        startKey,             // KEYS[3]
        waitingHeartbeatKey,  // KEYS[4] [NEW] Truyền key nhịp tim chờ để lua script dọn dẹp
        now,                  // ARGV[1]
        batchSize,            // ARGV[2]
        sessionTtlMs          // ARGV[3]
      );

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