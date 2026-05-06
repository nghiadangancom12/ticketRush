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

    // Chỉ lấy đúng các ghế đang bị user này giữ để emit realtime chính xác.
    const releasableSeats = await prisma.seats.findMany({
      where: {
        id: { in: seatIds },
        status: 'LOCKED',
        locked_by: userId,
      },
      select: { id: true },
    });

    const releasedSeatIds = releasableSeats.map((s) => s.id);

    if (releasedSeatIds.length === 0) {
      console.log(`[BullMQ] ℹ️ Không có ghế nào cần nhả cho user ${userId} (đã thanh toán hoặc đã hủy trước).`);
      return { released: 0, releasedSeatIds: [], eventId };
    }

    const result = await prisma.seats.updateMany({
      where: {
        id: { in: releasedSeatIds },
      },
      data: {
        status: 'AVAILABLE',
        locked_by: null,
        locked_at: null,
      },
    });

    console.log(`[BullMQ] ✅ Đã tự động nhả ${result.count} ghế của user ${userId} do hết timeout.`);

    return { released: result.count, releasedSeatIds, eventId };
  },
  {
    connection: redisConnection,
  }
);

seatReleaseWorker.on('completed', (job, result) => {
  console.log(`[BullMQ] 🎯 Job nhả ghế #${job.id} hoàn thành. Ghế đã nhả: ${result.released}`);

  if (result?.released > 0 && result?.eventId) {
    // Publish qua Redis Pub/Sub để api server (có socket.io) forward realtime đến clients.
    const payload = JSON.stringify({
      eventId: result.eventId,
      seats: result.releasedSeatIds,
      status: 'AVAILABLE',
      reason: 'TIMEOUT',
    });
    publisher.publish('seatStatusChanged', payload).catch((err) => {
      console.error('[BullMQ] Publish Redis thất bại:', err.message);
    });
  }
});

seatReleaseWorker.on('failed', (job, err) => {
  console.error(`[BullMQ] 🚨 Job nhả ghế #${job?.id} thất bại: ${err.message}`);
});

module.exports = seatReleaseWorker;