const { Queue } = require('bullmq');
const redisConnection = require('../../config/redisBullMQ');

const redisDisabled = process.env.DISABLE_REDIS === 'true';

function createNoopQueue(name) {
  return {
    name,
    async add() {
      return { id: null, name };
    },
    async close() {},
  };
}
// Cấu hình mặc định để tối ưu RAM cho Redis
const defaultQueueOptions = {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: true, // Xóa sạch job khỏi RAM ngay khi thành công
    removeOnFail: 1000,     // Chỉ giữ lại tối đa 1000 job lỗi gần nhất để debug
  },
};
/**
 * Hàng đợi nhả ghế tự động (Delayed Jobs).
 * Producer: BookingService.scheduleRelease()
 * Consumer: seatReleaseWorker.js
 */
const seatReleaseQueue = redisDisabled
  ? createNoopQueue('seat-release')
  : new Queue('seat-release', defaultQueueOptions);

/**
 * Hàng đợi gửi email vé (Background Jobs).
 * Producer: BookingService.checkout()
 * Consumer: emailWorker.js (concurrency: 4)
 */
const emailQueue = redisDisabled
  ? createNoopQueue('email-service')
  : new Queue('email-service', { connection: defaultQueueOptions });

module.exports = {
  seatReleaseQueue,
  emailQueue,
};
