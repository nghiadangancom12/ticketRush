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

/**
 * Hàng đợi nhả ghế tự động (Delayed Jobs).
 * Producer: BookingService.scheduleRelease()
 * Consumer: seatReleaseWorker.js
 */
const seatReleaseQueue = redisDisabled
  ? createNoopQueue('seat-release')
  : new Queue('seat-release', { connection: redisConnection });

/**
 * Hàng đợi gửi email vé (Background Jobs).
 * Producer: BookingService.checkout()
 * Consumer: emailWorker.js (concurrency: 4)
 */
const emailQueue = redisDisabled
  ? createNoopQueue('email-service')
  : new Queue('email-service', { connection: redisConnection });

module.exports = {
  seatReleaseQueue,
  emailQueue,
};
