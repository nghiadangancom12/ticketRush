const bookingRepo = require('./BookingRepository');
const prisma = require('../../config/database-booking');
const redis = require('../../config/redis');
const AppError = require('../errorHandling/AppError');

class BookingQueryService {
  /**
   * CQRS Read Side: Đọc sơ đồ ghế từ Redis Read Model.
   * Thundering Herd Protection: Đọc duy nhất từ Redis Read Model. Single-flight warm-up nếu chưa có.
   */
  async getSeatMap(eventId) {
    const cacheKey = `cache:seatmap:${eventId}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      console.error(`[BookingQueryService] ⚠️ Lỗi đọc Redis seatmap event_${eventId}:`, err.message);
    }

    // Warm-up từ booking_db (bảng seats đã denormalize zone_name, zone_price, event_id)
    const allSeats = await prisma.seats.findMany({
      where: { event_id: eventId },
      orderBy: [{ row_label: 'asc' }, { seat_number: 'asc' }]
    });

    if (!allSeats || allSeats.length === 0) {
      // Trả mảng rỗng nếu chưa có ghế thay vì sập
      return { eventId, title: 'Ticket Event', zones: [] };
    }

    // Nhóm seats theo zone_name
    const zonesMap = new Map();
    allSeats.forEach(s => {
      if (!zonesMap.has(s.zone_name)) {
        zonesMap.set(s.zone_name, {
          id: s.zone_id,
          name: s.zone_name,
          price: Number(s.zone_price),
          seats: []
        });
      }
      zonesMap.get(s.zone_name).seats.push({
        id: s.id,
        seat_number: s.seat_number,
        row_label: s.row_label,
        status: s.status,
        locked_by: s.locked_by
      });
    });

    const seatMap = {
      eventId,
      title: 'Ticket Event',
      zones: Array.from(zonesMap.values())
    };

    try {
      await redis.set(cacheKey, JSON.stringify(seatMap), 'EX', 300);
    } catch (err) {
      console.error(`[BookingQueryService] ⚠️ Lỗi ghi Redis seatmap event_${eventId}:`, err.message);
    }

    return seatMap;
  }

  /**
   * CQRS Read Side: Đọc danh sách vé cá nhân đã mua
   */
  async getUserTickets(userId) {
    return bookingRepo.getUserTickets(userId);
  }
}

module.exports = new BookingQueryService();
