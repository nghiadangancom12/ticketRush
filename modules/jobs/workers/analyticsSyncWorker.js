const prisma = require('../../../config/database-analytics');
const redisSubscriber = require('../../../config/redisSubscriber');
const { EVENTS } = require('../../../config/eventCatalog');

console.log('🚀 Analytics Sync Worker đang chạy...');

const redisEnabled = process.env.DISABLE_REDIS !== 'true';

if (redisEnabled) {
  redisSubscriber.subscribe(EVENTS.ANALYTICS_ORDER_CREATED, EVENTS.ANALYTICS_USER_REGISTERED, (err, count) => {
    if (err) {
      console.error('❌ [AnalyticsSyncWorker] Subscribe event thất bại:', err.message);
    } else {
      console.log(`🔔 [AnalyticsSyncWorker] Đang lắng nghe ${count} kênh Pub/Sub: ${EVENTS.ANALYTICS_ORDER_CREATED}, ${EVENTS.ANALYTICS_USER_REGISTERED}`);
    }
  });

  redisSubscriber.on('message', async (channel, message) => {
    try {
      const payload = JSON.parse(message);

      if (channel === EVENTS.ANALYTICS_ORDER_CREATED) {
        const { orderId, userId, userEmail, eventId, eventTitle, categoryName, totalAmount, orderStatus, createdAt } = payload;
        await prisma.analytics_order_summary.upsert({
          where: { order_id: orderId },
          create: {
            order_id: orderId,
            user_id: userId,
            user_email: userEmail || 'unknown@ticketrush.com',
            event_id: eventId,
            event_title: eventTitle || 'Ticket Event',
            category_name: categoryName || 'Uncategorized',
            total_amount: totalAmount,
            order_status: orderStatus || 'PAID',
            created_at: new Date(createdAt || Date.now())
          },
          update: {
            total_amount: totalAmount,
            order_status: orderStatus || 'PAID'
          }
        });
        console.log(`[AnalyticsSyncWorker] 📊 Sync thành công order #${orderId} cho event "${eventTitle}"`);
      }

      if (channel === EVENTS.ANALYTICS_USER_REGISTERED) {
        const { userId, gender, dateOfBirth } = payload;
        await prisma.analytics_order_summary.updateMany({
          where: { user_id: userId },
          data: {
            user_gender: gender || null,
            user_dob: dateOfBirth ? new Date(dateOfBirth) : null
          }
        });
        console.log(`[AnalyticsSyncWorker] 📊 Sync thông tin user #${userId} sang Analytics DB`);
      }
    } catch (err) {
      console.error(`[AnalyticsSyncWorker] ❌ Lỗi xử lý event ${channel}:`, err.message);
    }
  });
}

module.exports = { name: 'analyticsSyncWorker' };
