const { Worker } = require('bullmq');
const redisConnection = require('../../../config/redisBullMQ');
const prisma = require('../../../config/database');
const Redis = require('ioredis');

// Publisher riêng để publish lên channel — không dùng chung với connection BullMQ.
const isTls = process.env.REDIS_URL?.startsWith('rediss://');
const publisher = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, isTls ? { tls: {} } : {})
  : new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT) || 6379,
    });

/**
 * Worker xử lý nhả ghế tự động sau timeout.
 * Lắng nghe queue 'seat-release' (khớp với tên trong queues.js).
 */
const seatReleaseWorker = new Worker(
  'seat-release',
  async (job) => {
    const { seatIds, userId, eventId } = job.data;
    console.log(`[BullMQ] ⏳ Đang xử lý job nhả ghế #${job.id} cho user: ${userId}`);

    // Dùng Transaction và Khóa dòng (Row-level lock) để đồng bộ với luồng Checkout
    const result = await prisma.$transaction(async (tx) => {
      // 1. Khóa các ghế này lại để đọc trạng thái chính xác nhất
      const placeholders = seatIds.map((_, i) => `$${i + 1}::uuid`).join(', ');
      const query = `
        SELECT id, status, locked_by, locked_at FROM "seats"
        WHERE id IN (${placeholders})
        FOR UPDATE
      `;
      // Bắt buộc ép kiểu để Prisma trả về Array thuần
      const lockedSeatsQuery = await tx.$queryRawUnsafe(query, ...seatIds);

      // 2. Lọc ra những ghế THỰC SỰ cần nhả
      const cutoff = new Date(Date.now() - 58 * 1000);
      const releasableSeats = lockedSeatsQuery.filter(s => 
        s.status === 'LOCKED' && 
        String(s.locked_by) === String(userId) && 
        new Date(s.locked_at) <= cutoff
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
      console.log(`[BullMQ] ℹ️ Không có ghế nào cần nhả cho user ${userId} (đã thanh toán, đã hủy, hoặc đã re-hold).`);
      return { released: 0, releasedSeatIds: [], eventId };
    }

    console.log(`[BullMQ] ✅ Đã tự động nhả ${result.count} ghế của user ${userId} do hết timeout.`);
    return { released: result.count, releasedSeatIds: result.releasedSeatIds, eventId };
  },
  {
    connection: redisConnection,
  }
);
module.exports = seatReleaseWorker;