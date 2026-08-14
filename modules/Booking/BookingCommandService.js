const crypto = require('crypto');
const prisma = require('../../config/database-booking');
const AppError = require('../errorHandling/AppError');
const bookingRepo = require('./BookingRepository');
const redisPublisher = require('../../config/redisPublisher');
const redis = require('../../config/redis');
const { seatReleaseQueue, emailQueue } = require('../jobs/queues');
const { EVENTS } = require('../../config/eventCatalog');

class BookingCommandService {
  /**
   * Helper Proactive Push: Cập nhật đè trực tiếp trạng thái ghế trong Redis Read Model
   */
  async updateSeatMapCacheStatus(eventId, seatIds, newStatus, lockedBy = null) {
    const cacheKey = `cache:seatmap:${eventId}`;
    try {
      const cached = await redis.get(cacheKey);
      if (!cached) return;

      const seatMap = JSON.parse(cached);
      const seatSet = new Set(seatIds);

      seatMap.zones.forEach(zone => {
        zone.seats.forEach(seat => {
          if (seatSet.has(seat.id)) {
            seat.status = newStatus;
            seat.locked_by = newStatus === 'LOCKED' ? lockedBy : (newStatus === 'AVAILABLE' ? null : seat.locked_by);
          }
        });
      });

      await redis.set(cacheKey, JSON.stringify(seatMap), 'EX', 300);
    } catch (err) {
      console.error(`[BookingCommandService] ⚠️ Lỗi cập nhật Proactive Read Model cho event_${eventId}:`, err.message);
    }
  }

  /**
   * CQRS Command Side: Giữ ghế via Stored Procedure + Proactive Read Model Update
   */
  async holdSeats(userId, eventId, seatIds) {
    const result = await bookingRepo.holdSeatsViaProcedure(userId, eventId, seatIds);

    if (!result || result.length === 0) {
      throw new AppError('Giữ ghế thất bại. Có thể ghế đã được người khác chọn!', 400);
    }

    const lockedIds = result.map(r => r.id || r.seat_id);

    // Proactive Push: Cập nhật đè trực tiếp vào Redis Read Model thay vì xóa trắng
    await this.updateSeatMapCacheStatus(eventId, lockedIds, 'LOCKED', userId);

    return lockedIds;
  }

  /**
   * Lên lịch nhả ghế tự động sau 60 giây
   */
  async scheduleRelease(userId, eventId, seatIds) {
    const jobId = `release_${eventId}_${userId}`;
    await seatReleaseQueue.add(
      'release-seats',
      { userId, eventId, seatIds },
      { jobId, delay: 60000, removeOnComplete: true }
    );
  }

  /**
   * CQRS Command Side: Thanh toán & Xuất vé + Proactive Read Model Update
   */
  async checkout(userId, eventId, userEmail = '') {
    // Đọc thông tin event title & category từ Redis Cache
    let eventTitle = 'Ticket Event';
    let categoryName = null;
    try {
      const cachedLanding = await redis.get(`cache:event:landing:${eventId}`);
      if (cachedLanding) {
        const landing = JSON.parse(cachedLanding);
        if (landing.title) eventTitle = landing.title;
      }
    } catch (err) {}

    const result = await prisma.$transaction(async (tx) => {
      const lockedSeats = await bookingRepo.getLockedSeatsForCheckout(userId, eventId, tx);

      if (lockedSeats.length === 0) {
        throw new AppError('Bạn không có vé nào đang giữ hoặc vé đã hết hạn thanh toán.', 400);
      }

      const seatIds = lockedSeats.map(s => s.id);
      const totalAmount = lockedSeats.reduce((sum, seat) => sum + Number(seat.zone_price), 0);

      const snapshotData = {
        event_title: eventTitle,
        category_name: categoryName,
        user_email: userEmail
      };

      const newOrder = await bookingRepo.createOrder(userId, eventId, totalAmount, snapshotData, tx);

      const ticketData = lockedSeats.map(seat => {
        const randomStr = crypto.randomBytes(4).toString('hex').toUpperCase();
        const ticketCode = `TR-${randomStr.substring(0, 4)}-${randomStr.substring(4, 8)}`;
        return {
          order_id: newOrder.id,
          seat_id: seat.id,
          qr_code: ticketCode,
          status: 'UNUSED'
        };
      });

      await bookingRepo.createTickets(ticketData, tx);
      await bookingRepo.updateSeatsToSold(seatIds, tx);

      return { order: newOrder, seats: seatIds };
    });

    // 1. Gửi Email Background
    await emailQueue.add('send-ticket-email', { orderId: result.order.id }, {
      attempts: 3, backoff: { type: 'exponential', delay: 2000 }
    });

    // 2. Hủy Job nhả ghế 60s
    try {
      const releaseJob = await seatReleaseQueue.getJob(`release_${eventId}_${userId}`);
      if (releaseJob) await releaseJob.remove();
    } catch (err) {
      console.error('[BullMQ] Lỗi xoá job:', err.message);
    }

    // 3. Proactive Push: Cập nhật đè trực tiếp trạng thái ghế thành SOLD trong Read Model
    await this.updateSeatMapCacheStatus(eventId, result.seats, 'SOLD');

    // 4. Event-Driven: Báo hệ thống giải phóng Slot & Sync Analytics
    try {
      await redisPublisher.publish(EVENTS.BOOKING_CHECKOUT_COMPLETED, JSON.stringify({ userId, eventId, orderId: result.order.id }));
      if (EVENTS.ANALYTICS_ORDER_CREATED) {
        await redisPublisher.publish(EVENTS.ANALYTICS_ORDER_CREATED, JSON.stringify({
          orderId: result.order.id,
          userId,
          userEmail,
          eventId,
          eventTitle,
          categoryName,
          totalAmount: result.order.total_amount,
          orderStatus: 'PAID',
          createdAt: result.order.created_at
        }));
      }
    } catch (err) {
      console.error('Lỗi publish checkout events:', err.message);
    }

    return result;
  }

  /**
   * CQRS Command Side: Chủ động trả vé + Proactive Read Model Update
   */
  async returnSeats(userId, eventId) {
    const result = await prisma.$transaction(async (tx) => {
      const lockedSeats = await bookingRepo.getLockedSeatsForCheckout(userId, eventId, tx);

      if (lockedSeats.length === 0) {
        return { releasedIds: [] };
      }

      const ids = lockedSeats.map(s => s.id);
      await bookingRepo.updateSeatsToAvailable(ids, tx);

      return { releasedIds: ids };
    });

    if (result.releasedIds.length > 0) {
      try {
        const releaseJob = await seatReleaseQueue.getJob(`release_${eventId}_${userId}`);
        if (releaseJob) await releaseJob.remove();
      } catch (err) {}

      // Proactive Push: Cập nhật đè trực tiếp trạng thái ghế thành AVAILABLE trong Read Model
      await this.updateSeatMapCacheStatus(eventId, result.releasedIds, 'AVAILABLE');

      try {
        await redisPublisher.publish(EVENTS.BOOKING_SEATS_RETURNED, JSON.stringify({ userId, eventId }));
      } catch (err) {
        console.error('[Booking] Lỗi publish event:', err.message);
      }
    }
    return result;
  }
}

module.exports = new BookingCommandService();
