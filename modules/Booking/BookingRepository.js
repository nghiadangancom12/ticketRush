const prisma = require('../../config/database');

class BookingRepository {
  async countUserSeatsInEvent(userId, eventId) {
    return prisma.seats.count({
      where: {
        locked_by: userId,
        zones: { event_id: eventId },
        status: { in: ['LOCKED', 'SOLD'] }
      }
    });
  }

  async getSeatsForUpdate(seatIds) {
    const placeholders = seatIds.map((_, i) => `$${i + 1}`).join(', ');
    const query = `
      SELECT id, status FROM "seats"
      WHERE id IN (${placeholders})
      FOR UPDATE
    `;
    return prisma.$queryRawUnsafe(query, ...seatIds);
  }

  async updateSeatsToLocked(seatIds, userId, lockedAt) {
    return prisma.seats.updateMany({
      where: { id: { in: seatIds } },
      data: {
        status: 'LOCKED',
        locked_by: userId,
        locked_at: lockedAt
      }
    });
  }

  async getLockedSeatsForCheckout(userId, eventId) {
    return prisma.seats.findMany({
      where: {
        locked_by: userId,
        status: 'LOCKED',
        zones: { event_id: eventId }
      },
      include: { zones: true }
    });
  }

  async createOrder(userId, totalAmount) {
    return prisma.orders.create({
      data: {
        user_id: userId,
        total_amount: totalAmount,
        status: 'PAID'
      }
    });
  }

  async createTicket(orderId, seatId, qrCode) {
    return prisma.tickets.create({
      data: {
        order_id: orderId,
        seat_id: seatId,
        qr_code: qrCode
      }
    });
  }

  async updateSeatsToSold(seatIds) {
    return prisma.seats.updateMany({
      where: { id: { in: seatIds } },
      data: { status: 'SOLD' }
    });
  }
}

module.exports = new SeatRepository();
