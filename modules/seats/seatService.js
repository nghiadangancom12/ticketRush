const seatRepository = require('./seatRepository');
const AppError = require('../errorHandling/AppError');

class SeatService {
  async holdSeats(userId, eventId, seatIds) {
    if (!seatIds || seatIds.length === 0 || !eventId) {
      throw new AppError('Missing seatIds or eventId', 400);
    }
    if (seatIds.length > 4) {
      throw new AppError('Bạn chỉ được giữ tối đa 4 vé trong 1 sự kiện.', 400);
    }

    const userSeatsInEvent = await seatRepository.countUserSeatsInEvent(userId, eventId);

    if (userSeatsInEvent + seatIds.length > 4) {
      throw new AppError('Bạn chỉ được giữ/mua tổng cộng tối đa 4 vé trong 1 sự kiện.', 400);
    }

    const lockedSeatsQuery = await seatRepository.getSeatsForUpdate(seatIds);

    const unavailable = lockedSeatsQuery.filter(s => s.status !== 'AVAILABLE');
    if (unavailable.length > 0) {
      throw new AppError('Một hoặc nhiều ghế đã bị người khác giữ.', 400);
    }

    await seatRepository.updateSeatsToLocked(seatIds, userId, new Date());

    return seatIds;
  }

  async checkout(userId, eventId) {
    const lockedSeats = await seatRepository.getLockedSeatsForCheckout(userId, eventId);

    if (lockedSeats.length === 0) {
      throw new AppError('Bạn không có vé nào đang giữ (có thể đã hết hạn 1 phút).', 400);
    }

    const totalAmount = lockedSeats.reduce((sum, seat) => sum + Number(seat.zones.price), 0);

    const newOrder = await seatRepository.createOrder(userId, totalAmount);

    const ticketPromises = lockedSeats.map(seat => {
      return seatRepository.createTicket(
        newOrder.id,
        seat.id,
        `TICKET-${newOrder.id}-${seat.id}`
      );
    });

    await Promise.all(ticketPromises);

    await seatRepository.updateSeatsToSold(lockedSeats.map(s => s.id));

    return { order: newOrder, seats: lockedSeats.map(s => s.id) };
  }
}

module.exports = new SeatService();
