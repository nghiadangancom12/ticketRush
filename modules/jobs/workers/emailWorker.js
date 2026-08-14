const { Worker } = require('bullmq');
const redisConnection = require('../../../config/redisBullMQ');
const prisma = require('../../../config/database-booking');
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

    // Lấy thông tin đơn hàng kèm vé & ghế từ booking_db (đã snapshot user_email, event_title, zone_name, zone_price)
    const fullOrder = await prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        tickets: {
          include: {
            seats: true
          }
        }
      }
    });

    if (!fullOrder) {
      console.warn(`[BullMQ] ⚠️ Không tìm thấy đơn hàng ${orderId}, bỏ qua gửi email.`);
      return { sent: false, reason: 'ORDER_NOT_FOUND' };
    }

    const targetEmail = fullOrder.user_email;
    if (!targetEmail) {
      console.warn(`[BullMQ] ⚠️ Đơn hàng ${orderId} không có email user, bỏ qua.`);
      return { sent: false, reason: 'NO_USER_EMAIL' };
    }

    // Adapt structure cho EmailService.sendTicketEmail
    const adaptedOrder = {
      id: fullOrder.id,
      users: {
        email: targetEmail,
        full_name: targetEmail.split('@')[0] || 'Khách hàng'
      },
      tickets: fullOrder.tickets.map(t => ({
        ...t,
        seats: {
          ...t.seats,
          zones: {
            name: t.seats.zone_name,
            price: t.seats.zone_price,
            events: {
              title: fullOrder.event_title,
              location: 'Chi tiết xem trên trang sự kiện',
              start_time: fullOrder.created_at
            }
          }
        }
      }))
    };

    await EmailService.sendTicketEmail(adaptedOrder);
    console.log(`[BullMQ] ✅ Đã gửi email vé thành công cho đơn hàng: ${orderId} → ${targetEmail}`);

    return { sent: true, to: targetEmail };
  },
  {
    connection: redisConnection,
    concurrency: 4, // 4 workers xử lý song song
  }
);

emailWorker.on('completed', (job, result) => {
  if (result?.sent) {
    console.log(`[BullMQ] 🎯 Job email #${job.id} hoàn thành → gửi tới: ${result.to}`);
  }
});

emailWorker.on('failed', (job, err) => {
  console.error(`[BullMQ] 🚨 Job email #${job?.id} thất bại: ${err.message}`);
});

// Chế độ chạy Standalone Service Process
if (require.main === module) {
  console.log('🚀 Standalone Email Worker đang chạy...');

  const shutdown = async (signal, exitCode = 0) => {
    console.log(`\n⚠️  Nhận tín hiệu ${signal}. Đang dừng Email Worker...`);
    try {
      await emailWorker.close();
      console.log('✅ Email Worker đã dừng an toàn.');
      process.exit(exitCode);
    } catch (err) {
      console.error('❌ Lỗi khi dừng Email Worker:', err.message);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM', 0));
  process.on('SIGINT', () => shutdown('SIGINT', 0));

  process.on('unhandledRejection', (err) => {
    console.error('❌ [EmailWorker] Unhandled Rejection:', err);
    shutdown('unhandledRejection', 1);
  });

  process.on('uncaughtException', (err) => {
    console.error('❌ [EmailWorker] Uncaught Exception:', err);
    shutdown('uncaughtException', 1);
  });
}

module.exports = emailWorker;
