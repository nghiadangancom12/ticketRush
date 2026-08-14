const crypto = require('crypto');
const redis = require('../../../config/redis');
const queueService = require('../../queue/queueService');
const redisPublisher = require('../../../config/redisPublisher');
const redisSubscriber = require('../../../config/redisSubscriber');
const { EVENTS } = require('../../../config/eventCatalog');

const BATCH_SIZE = Number(process.env.QUEUE_BATCH_SIZE || 50);
const SESSION_TTL_SECONDS = Number(process.env.QUEUE_SESSION_TTL_SECONDS || 20);
const HARD_TIMEOUT_MINUTES = Number(process.env.QUEUE_HARD_TIMEOUT_MINUTES || 10);
const LEADER_LOCK_KEY = 'queue_worker:leader_lock';
const LEADER_LOCK_TTL_SEC = 10;

// Subscribe Redis Pub/Sub events để dọn dẹp slot bất đồng bộ
const redisEnabled = process.env.DISABLE_REDIS !== 'true';
if (redisEnabled) {
  redisSubscriber.subscribe(EVENTS.BOOKING_CHECKOUT_COMPLETED, EVENTS.BOOKING_SEATS_RETURNED, (err, count) => {
    if (err) {
      console.error('❌ [QueueWorker] Subscribe event thất bại:', err.message);
    } else {
      console.log(`🔔 [QueueWorker] Đang lắng nghe ${count} kênh Pub/Sub: ${EVENTS.BOOKING_CHECKOUT_COMPLETED}, ${EVENTS.BOOKING_SEATS_RETURNED}`);
    }
  });

  redisSubscriber.on('message', async (channel, message) => {
    if (channel === EVENTS.BOOKING_CHECKOUT_COMPLETED || channel === EVENTS.BOOKING_SEATS_RETURNED) {
      try {
        const { eventId, userId } = JSON.parse(message);
        if (eventId && userId) {
          await queueService.removeAllowed(eventId, userId);
          console.log(`[QueueWorker] 🎟️ Nhận event ${channel} -> Đã giải phóng queue slot cho user ${userId} (eventId: ${eventId})`);
        }
      } catch (err) {
        console.error(`[QueueWorker] ❌ Lỗi xử lý event ${channel}:`, err.message);
      }
    }
  });
}

class QueueWorker {
  constructor() {
    this.timeoutId = null;
    this.io = null;
    this.isRunning = false;
    this.instanceId = `worker_${process.pid}_${crypto.randomBytes(4).toString('hex')}`;
  }

  setIO(io) {
    this.io = io;
    console.log('[QueueWorker] Đã nhận kết nối Socket.io thành công!');
  }

  start() {
    this.isRunning = true;
    this.loop();
    console.log(`🚀 Background QueueWorker started! (Instance ID: ${this.instanceId})`);
  }

  stop() {
    this.isRunning = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      console.log('🛑 QueueWorker stopped.');
    }
  }

  async acquireLeaderLock() {
    try {
      // Dùng SET key value EX ttl NX để chọn Leader instance (Single-instance guardrail)
      const result = await redis.set(LEADER_LOCK_KEY, this.instanceId, 'EX', LEADER_LOCK_TTL_SEC, 'NX');
      if (result === 'OK') {
        return true;
      }
      // Nếu instance này hiện đang giữ lock, gia hạn lại TTL
      const currentLeader = await redis.get(LEADER_LOCK_KEY);
      if (currentLeader === this.instanceId) {
        await redis.expire(LEADER_LOCK_KEY, LEADER_LOCK_TTL_SEC);
        return true;
      }
      return false;
    } catch (err) {
      console.error('[QueueWorker] ⚠️ Lỗi khi kiểm tra Leader Lock:', err.message);
      return false;
    }
  }

  async loop() {
    if (!this.isRunning) return;

    try {
      const isLeader = await this.acquireLeaderLock();
      if (isLeader) {
        await this.run();
      }
    } catch (err) {
      console.error('QueueWorker Error:', err);
    } finally {
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

        const hardExpireAt = Date.now() + (HARD_TIMEOUT_MINUTES * 60 * 1000);

        // 🚀 TỐI ƯU HÓA: Dùng Promise.all để phát thông báo song song (Concurrent I/O)
        await Promise.all(luckyUsers.map(async (userId) => {
          const payload = {
            userId,
            eventId,
            status: 'YOUR_TURN',
            message: `Đã đến lượt bạn! Bạn có ${HARD_TIMEOUT_MINUTES} phút để hoàn tất chọn ghế.`,
            expireAt: hardExpireAt,
            hardTimeoutMinutes: HARD_TIMEOUT_MINUTES,
          };

          // 📡 Publish qua Redis Pub/Sub cho Real-time Socket Gateway
          try {
            await redisPublisher.publish(EVENTS.QUEUE_TURN, JSON.stringify(payload));
          } catch (pubErr) {
            console.error(`[QueueWorker] ❌ Publish queueTurn cho user ${userId} thất bại:`, pubErr.message);
          }

          // Fallback tương thích chế độ Monolith (nếu bạn vẫn chạy gộp io vào Core API)
          if (this.io) {
            // Đảm bảo userId luôn là String để Socket.io tìm đúng Room
            this.io.to(userId.toString()).emit('queue_turn', payload);
          }
        }));
      }
    }
  }
}

const queueWorker = new QueueWorker();

// Chế độ chạy Standalone Service Process
if (require.main === module) {
  console.log('🚀 Standalone Virtual Queue Worker đang chạy...');
  queueWorker.start();

  const shutdown = (signal) => {
    console.log(`\n⚠️  Nhận tín hiệu ${signal}. Đang dừng Queue Worker...`);
    queueWorker.stop();
    console.log('✅ Queue Worker đã dừng an toàn.');
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (err) => {
    console.error('❌ [QueueWorker] Unhandled Rejection:', err);
    queueWorker.stop();
    process.exit(1);
  });

  process.on('uncaughtException', (err) => {
    console.error('❌ [QueueWorker] Uncaught Exception:', err);
    queueWorker.stop();
    process.exit(1);
  });
}

module.exports = queueWorker;