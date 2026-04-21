const prisma = require('../../config/database');
const AppError = require('../errorHandling/AppError');
const EmailService = require('../../utils/email');
class BookingService {
  async holdSeats(userId, eventId, seatIds) {
    return await prisma.$transaction(async (tx) => {
      // 1. NGHIỆP VỤ: Kiểm tra tổng số vé User đang giữ trong Event này
      // (Đoạn này phải giữ lại vì Zod không thể chui vào DB để đếm số vé cũ được)
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

      // 2. NGHIỆP VỤ: Row-Level Locking để chống Double-booking
      const placeholders = seatIds.map((_, i) => `$${i + 1}`).join(', ');
      
      const query = `
        SELECT id, status FROM "seats"
        WHERE id IN (${placeholders})
        FOR UPDATE
      `;
      const lockedSeatsQuery = await tx.$queryRawUnsafe(query, ...seatIds);

      const unavailable = lockedSeatsQuery.filter(s => s.status !== 'AVAILABLE');
      if (unavailable.length > 0) {
        throw new AppError('Một hoặc nhiều ghế đã bị người khác giữ. Vui lòng chọn ghế khác.', 400);
      }

      // 3. Cập nhật trạng thái ghế
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
    const result = await prisma.$transaction(async (tx) => {
      // 1. NGHIỆP VỤ: Lấy các ghế đang giữ còn trong thời hạn
      const HOLD_MINUTES = 1;
      const expiryTime = new Date(Date.now() - HOLD_MINUTES * 60 * 1000);

      const lockedSeats = await tx.seats.findMany({
        where: {
          locked_by: userId,
          status: 'LOCKED',
          zones: { event_id: eventId },
          locked_at: { gte: expiryTime } 
        },
        include: { zones: true }
      });

      if (lockedSeats.length === 0) {
        throw new AppError('Bạn không có vé nào đang giữ hoặc vé đã hết hạn thanh toán.', 400);
      }

      // 2. Tính tiền và tạo Đơn hàng
      const totalAmount = lockedSeats.reduce((sum, seat) => sum + Number(seat.zones.price), 0);
      
      const newOrder = await tx.orders.create({
        data: {
          total_amount: totalAmount,
          status: 'PAID',
          users: { 
            connect: { id: userId } 
          }
        }
      });

      // 3. In Vé (Bulk Insert)
      const ticketData = lockedSeats.map(seat => {
        const randomStr = Math.random().toString(36).substring(2, 10).toUpperCase();
        const ticketCode = `TR-${randomStr.substring(0, 4)}-${randomStr.substring(4, 8)}`;
        
        return {
          order_id: newOrder.id,
          seat_id: seat.id,
          qr_code: ticketCode
        };
      });
      await tx.tickets.createMany({ data: ticketData });

      // 4. Chốt ghế
      await tx.seats.updateMany({
        where: { id: { in: lockedSeats.map(s => s.id) } },
        data: { status: 'SOLD' }
      });

      return { order: newOrder, seats: lockedSeats.map(s => s.id) };
    });

    // 5. Gửi email vé thành công (Asynchronous)
    // Chúng ta không đợi email gửi xong mới trả kết quả cho Client để tối ưu tốc độ.
    this._sendTicketEmailAsync(result.order.id).catch(err => {
      console.error('❌ Lỗi gửi email vé sau checkout:', err.message);
    });

    // 🚀 THÊM MỚI Ở ĐÂY: Giải phóng Slot Sớm
    try {
      const queueService = require('../queue/queueService');
      await queueService.removeAllowed(eventId, userId);
    } catch(err) {
      console.error('Lỗi khi xoá queue allowed:', err.message);
    }

    return result;
  }

  /**
   * Hàm helper để lấy đầy đủ thông tin và gửi email vé
   */
  async _sendTicketEmailAsync(orderId) {
    try {
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
                      events: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (fullOrder) {
        await EmailService.sendTicketEmail(fullOrder);
        console.log(`📧 Đã gửi email vé cho đơn hàng: ${orderId}`);
      }
    } catch (error) {
      console.error('❌ Lỗi trong quá trình chuẩn bị gửi email vé:', error);
    }
  }
}

module.exports = new BookingService();