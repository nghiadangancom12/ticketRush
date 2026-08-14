const { Worker } = require('bullmq');
const redisConnection = require('../../../config/redisBullMQ');
const prisma = require('../../../config/database-booking');
const queueService = require('../../queue/queueService');
const Redis = require('ioredis');
const { EVENTS } = require('../../../config/eventCatalog');

// Publisher riêng để publish lên channel — không dùng chung với connection BullMQ.
const isTls = process.env.REDIS_URL?.startsWith('rediss://');
const publisher = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, isTls ? { tls: {} } : {})
  : new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT) || 6379,
    });

/**
 * Worker xử lý nhả ghế tự động sau timeout (60s).
 */
const seatReleaseWorker = new Worker(
  'seat-release',
  async (job) => {
    const { seatIds, userId, eventId } = job.data;
    console.log(`[BullMQ] ⏳ Đang xử lý job nhả ghế #${job.id} cho user: ${userId}`);

    // Dùng Transaction và Row-level lock (FOR UPDATE) để đồng bộ tuyệt đối với Checkout
    const result = await prisma.$transaction(async (tx) => {
      // 1. Khóa dòng các ghế này lại để đọc trạng thái chính xác nhất
      const placeholders = seatIds.map((_, i) => `$${i + 1}::uuid`).join(', ');
      const query = `
        SELECT id, status, locked_by FROM "seats"
        WHERE id IN (${placeholders})
        FOR UPDATE
      `;
      
      const lockedSeatsQuery = await tx.$queryRawUnsafe(query, ...seatIds);

      // 2. Lọc ra những ghế THỰC SỰ cần nhả (Còn ở trạng thái LOCKED và do đúng User này giữ)
      const releasableSeats = lockedSeatsQuery.filter(s => 
        s.status === 'LOCKED' && 
        String(s.locked_by) === String(userId)
      );

      const releasedSeatIds = releasableSeats.map((s) => s.id);

      if (releasedSeatIds.length === 0) {
        return { count: 0, releasedSeatIds: [], eventId };
      }

      // 3. Tiến hành nhả ghế một cách an toàn
      await tx.seats.updateMany({
        where: { id: { in: releasedSeatIds } },
        data: {
          status: 'AVAILABLE',
          locked_by: null,
          locked_at: null,
        },
      });

      return { count: releasedSeatIds.length, releasedSeatIds, eventId };
    });

    if (result.count === 0) {
      console.log(`[BullMQ] ℹ️ Không có ghế nào cần nhả cho user ${userId} (đã thanh toán hoặc đã chủ động hủy).`);
      return { released: 0, releasedSeatIds: [], eventId };
    }

    // 4. Bắn sự kiện Real-time thông báo cho Hệ thống và User
    try {
      // A. Broadcast cập nhật sơ đồ ghế cho TẤT CẢ mọi người
      await publisher.publish(EVENTS.SEAT_STATUS_CHANGED, JSON.stringify({
        eventId: result.eventId,
        seats: result.releasedSeatIds,
        status: 'AVAILABLE'
      }));

      // B. Bắn thông báo riêng cho USER bị hết thời gian giữ ghế
      await publisher.publish(EVENTS.SEAT_HOLD_EXPIRED, JSON.stringify({
        userId,
        eventId: result.eventId,
        message: 'Đã hết thời gian giữ ghế. Ghế của bạn đã được giải phóng.'
      }));

      console.log(`[BullMQ] 📡 Đã phát sự kiện seatStatusChanged & seatHoldExpired cho event_${result.eventId}`);
    } catch (pubErr) {
      console.error('[BullMQ] ❌ Lỗi publish event:', pubErr.message);
    }

    // 5. Giải phóng Slot trong Virtual Queue Redis để người tiếp theo được vào mua vé
    try {
      await queueService.removeAllowed(eventId, userId);
      console.log(`[BullMQ] 🧹 Đã giải phóng virtual queue slot cho user ${userId}`);
    } catch (queueErr) {
      console.error('[BullMQ] ❌ Lỗi xoá queue allowed:', queueErr.message);
    }

    console.log(`[BullMQ] ✅ Đã tự động nhả ${result.count} ghế của user ${userId} do hết timeout.`);
    return { released: result.count, releasedSeatIds: result.releasedSeatIds, eventId };
  },
  {
    connection: redisConnection,
  }
);

// Chế độ chạy Standalone Service Process
if (require.main === module) {
  console.log('🚀 Standalone Seat Release Worker đang chạy...');

  const shutdown = async (signal, exitCode = 0) => {
    console.log(`\n⚠️  Nhận tín hiệu ${signal}. Đang dừng Seat Release Worker...`);
    try {
      await seatReleaseWorker.close();
      await publisher.quit();
      console.log('✅ Seat Release Worker đã dừng an toàn.');
      process.exit(exitCode);
    } catch (err) {
      console.error('❌ Lỗi khi dừng Seat Release Worker:', err.message);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM', 0));
  process.on('SIGINT', () => shutdown('SIGINT', 0));

  process.on('unhandledRejection', (err) => {
    console.error('❌ [SeatReleaseWorker] Unhandled Rejection:', err);
    shutdown('unhandledRejection', 1);
  });

  process.on('uncaughtException', (err) => {
    console.error('❌ [SeatReleaseWorker] Uncaught Exception:', err);
    shutdown('uncaughtException', 1);
  });
}

module.exports = seatReleaseWorker;