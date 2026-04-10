const prisma = require('../../config/database');
const seatService = require('./seatService');
const AppError = require('../errorHandling/AppError');

class BookingFacade {
  async holdSeats(userId, eventId, seatIds) {
    return await prisma.$transaction(async (tx) => {
      if (!seatIds || seatIds.length === 0 || !eventId) {
        throw new AppError('Missing seatIds or eventId', 400);
      }
      if (seatIds.length > 4) {
        throw new AppError('Bạn chỉ được giữ tối đa 4 vé trong 1 sự kiện.', 400);
      }

      const userSeatsInEvent = await tx.seats.count({
        where: {
          locked_by: userId,
          zones: { event_id: eventId },
          status: { in: ['LOCKED', 'SOLD'] } 
        }
      });

      if (userSeatsInEvent + seatIds.length > 4) {
        throw new AppError('Bạn chỉ được giữ/mua tổng cộng tối đa 4 vé trong 1 sự kiện.', 400);
      }

      const placeholders = seatIds.map((_, i) => `$${i + 1}`).join(', ');
      
      const query = `
        SELECT id, status FROM "seats"
        WHERE id IN (${placeholders})
        FOR UPDATE
      `;
      const lockedSeatsQuery = await tx.$queryRawUnsafe(query, ...seatIds);

      const unavailable = lockedSeatsQuery.filter(s => s.status !== 'AVAILABLE');
      if (unavailable.length > 0) {
        throw new AppError('Một hoặc nhiều ghế đã bị người khác giữ.', 400);
      }

      await tx.seats.updateMany({
        where: { id: { in: seatIds } },
        data: {
          status: 'LOCKED',
          locked_by: userId,
          locked_at: new Date()
        }
      });

      return seatIds;
    });
  }

 async checkout(userId, eventId) {
    
  if (!userId) {
        throw new AppError('Invalid User ID', 400);
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Tính toán thời gian hết hạn (Ví dụ: 5 phút trước)
      const HOLD_MINUTES = 1;
      const expiryTime = new Date(Date.now() - HOLD_MINUTES * 60 * 1000);

      // 2. Tìm ghế đang giữ, BẮT BUỘC phải còn trong thời gian hiệu lực
      const lockedSeats = await tx.seats.findMany({
        where: {
          locked_by: userId,
          status: 'LOCKED',
          zones: { event_id: eventId },
          locked_at: { gte: expiryTime } // Double-check thời gian
        },
        include: { zones: true }
      });

      if (lockedSeats.length === 0) {
        throw new AppError('Bạn không có vé nào đang giữ hoặc vé đã hết hạn.', 400);
      }

      // 3. Giả lập thanh toán thành công lập tức
      const totalAmount = lockedSeats.reduce((sum, seat) => sum + Number(seat.zones.price), 0);
      
      // SỬA LỖI Ở ĐÂY: Sử dụng cú pháp connect của Prisma cho relation "users"
      const newOrder = await tx.orders.create({
        data: {
          total_amount: totalAmount,
          status: 'PAID',
          users: { 
            connect: { id: userId } 
          }
        }
      });

      // 4. Tối ưu: Dùng createMany để bulk-insert vé (Nhanh hơn Promise.all)
      const ticketData = lockedSeats.map(seat => ({
        order_id: newOrder.id,
        seat_id: seat.id,
        qr_code: `TICKET-${newOrder.id}-${seat.id}`
      }));
      await tx.tickets.createMany({ data: ticketData });

      // 5. Chốt ghế thành SOLD
      await tx.seats.updateMany({
        where: { id: { in: lockedSeats.map(s => s.id) } },
        data: { status: 'SOLD' }
      });

      return { order: newOrder, seats: lockedSeats.map(s => s.id) };
    });
  }
}

module.exports = new BookingFacade();
