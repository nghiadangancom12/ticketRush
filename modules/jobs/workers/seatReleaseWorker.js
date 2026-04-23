const { Worker } = require('bullmq');
const redisConnection = require('../../../config/redisBullMQ');
const prisma = require('../../../config/database');

/**
 * Worker xử lý nhả ghế tự động sau timeout.
 * Lắng nghe queue 'seat-release' (khớp với tên trong queues.js).
 * Không cần uuid-validate — prisma sẽ bỏ qua ID không hợp lệ mà không crash.
 */
const seatReleaseWorker = new Worker(
  'seat-release',
  async (job) => {
    const { seatIds, userId } = job.data;

    console.log(`[BullMQ] ⏳ Đang xử lý job nhả ghế #${job.id} cho user: ${userId}`);

    const result = await prisma.seats.updateMany({
      where: {
        id: { in: seatIds },
        status: 'LOCKED',     // Chỉ nhả ghế đang bị giữ
        locked_by: userId,    // Chỉ nhả đúng ghế của user này
      },
      data: {
        status: 'AVAILABLE',
        locked_by: null,
        locked_at: null,
      },
    });

    if (result.count > 0) {
      console.log(`[BullMQ] ✅ Đã tự động nhả ${result.count} ghế của user ${userId} do hết timeout.`);
    } else {
      console.log(`[BullMQ] ℹ️ Không có ghế nào cần nhả cho user ${userId} (đã thanh toán hoặc đã hủy trước).`);
    }

    return { released: result.count };
  },
  {
    connection: redisConnection,
  }
);

seatReleaseWorker.on('completed', (job, result) => {
  console.log(`[BullMQ] 🎯 Job nhả ghế #${job.id} hoàn thành. Ghế đã nhả: ${result.released}`);
});

seatReleaseWorker.on('failed', (job, err) => {
  console.error(`[BullMQ] 🚨 Job nhả ghế #${job?.id} thất bại: ${err.message}`);
});

module.exports = seatReleaseWorker;