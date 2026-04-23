const { Worker } = require('bullmq');
const redisConnection = require('../../../config/redisBullMQ');
const prisma = require('../../../config/database');
const EmailService = require('../../../utils/email');

/**
 * Worker gửi email vé sau khi thanh toán thành công.
 * concurrency: 4 — cho phép xử lý 4 email cùng lúc để không bị nghẽn.
 */
const emailWorker = new Worker(
  'email-service',
  async (job) => {
    const { orderId } = job.data;

    console.log(`[BullMQ] 📧 Đang xử lý job gửi email cho đơn hàng: ${orderId}`);

    // Bỏ qua nếu là job test (không có trong DB thật)
    if (orderId.startsWith('TEST-ORDER-')) {
      console.log(`[BullMQ] 🧪 Job test email cho orderId=${orderId}, bỏ qua DB query.`);
      return { sent: false, reason: 'TEST_ORDER' };
    }

    // Lấy đầy đủ thông tin đơn hàng kèm vé, ghế, khu vực, sự kiện
    const fullOrder = await prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        users: true,
        tickets: {
          include: {
            seats: {
              include: {
                zones: {
                  include: {
                    events: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!fullOrder) {
      console.warn(`[BullMQ] ⚠️ Không tìm thấy đơn hàng ${orderId}, bỏ qua gửi email.`);
      return { sent: false, reason: 'ORDER_NOT_FOUND' };
    }

    if (!fullOrder.users?.email) {
      console.warn(`[BullMQ] ⚠️ Đơn hàng ${orderId} không có email user, bỏ qua.`);
      return { sent: false, reason: 'NO_USER_EMAIL' };
    }

    await EmailService.sendTicketEmail(fullOrder);
    console.log(`[BullMQ] ✅ Đã gửi email vé thành công cho đơn hàng: ${orderId} → ${fullOrder.users.email}`);

    return { sent: true, to: fullOrder.users.email };
  },
  {
    connection: redisConnection,
    concurrency: 4, // 4 workers xử lý song song
  }
);

emailWorker.on('completed', (job, result) => {
  if (result.sent) {
    console.log(`[BullMQ] 🎯 Job email #${job.id} hoàn thành → gửi tới: ${result.to}`);
  }
});

emailWorker.on('failed', (job, err) => {
  console.error(`[BullMQ] 🚨 Job email #${job?.id} thất bại: ${err.message}`);
});

module.exports = emailWorker;
