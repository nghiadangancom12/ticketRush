const { Queue } = require('bullmq');
const redisConnection = require('../../config/redisBullMQ');

/**
 * Hàng đợi nhả ghế tự động (Delayed Jobs).
 * Producer: BookingService.scheduleRelease()
 * Consumer: seatReleaseWorker.js
 */
const seatReleaseQueue = new Queue('seat-release', { connection: redisConnection });

/**
 * Hàng đợi gửi email vé (Background Jobs).
 * Producer: BookingService.checkout()
 * Consumer: emailWorker.js (concurrency: 4)
 */
const emailQueue = new Queue('email-service', { connection: redisConnection });

module.exports = {
  seatReleaseQueue,
  emailQueue,
};
