const bookingQueryService = require('./BookingQueryService');
const bookingCommandService = require('./BookingCommandService');

/**
 * BookingService Facade (CQRS Pattern)
 * Tách biệt luồng Đọc/Query (Read Model) và luồng Ghi/Command (Write Model)
 */
class BookingService {
  // --- QUERY SIDE (READ MODEL) ---
  async getSeatMap(eventId) {
    return bookingQueryService.getSeatMap(eventId);
  }

  async getUserTickets(userId) {
    return bookingQueryService.getUserTickets(userId);
  }

  // --- COMMAND SIDE (WRITE MODEL & PROACTIVE PUSH) ---
  async holdSeats(userId, eventId, seatIds) {
    return bookingCommandService.holdSeats(userId, eventId, seatIds);
  }

  async scheduleRelease(userId, eventId, seatIds) {
    return bookingCommandService.scheduleRelease(userId, eventId, seatIds);
  }

  async checkout(userId, eventId) {
    return bookingCommandService.checkout(userId, eventId);
  }

  async returnSeats(userId, eventId) {
    return bookingCommandService.returnSeats(userId, eventId);
  }
}

module.exports = new BookingService();