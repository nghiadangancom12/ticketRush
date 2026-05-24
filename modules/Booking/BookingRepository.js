const prisma = require('../../config/database');
const { Prisma } = require('@prisma/client');

class BookingRepository {
  // ==========================================
  // CÁC HÀM KÍCH HOẠT STORED PROCEDURE (Tối ưu tải cao)
  // ==========================================

  /**
   * Gọi Stored Procedure giữ ghế dưới Neon DB (Chống Race Condition & Deadlock)
   */
  async holdSeatsViaProcedure(userId, eventId, seatIds, tx = prisma) {
    return tx.$queryRaw`
      SELECT * FROM hold_seats_procedure(
        ${userId}::uuid, 
        ${eventId}::uuid, 
        ${seatIds}::uuid[] 
      )
    `;
  }

  // ==========================================
  // CÁC HÀM PHỤC VỤ LUỒNG THANH TOÁN / ĐỌC DATA
  // ==========================================

  /**
   * Lấy danh sách ghế đang giữ để thực hiện thanh toán (Checkout).
   */
  async getLockedSeatsForCheckout(userId, eventId, tx = prisma) {
    return tx.seats.findMany({
      where: {
        locked_by: userId,
        status: 'LOCKED',
        zones: { event_id: eventId }
      },
      include: { 
        zones: true 
      }
    });
  }

  /**
   * Tạo đơn hàng mới.
   */
  async createOrder(userId, eventId, totalAmount, tx = prisma) {
    return tx.orders.create({
      data: {
        user_id: userId,
        event_id: eventId,
        total_amount: totalAmount,
        status: 'PAID'
      }
    });
  }

  /**
   * Tạo vé (Bulk Insert)
   */
  async createTickets(ticketsData, tx = prisma) {
    return tx.tickets.createMany({
      data: ticketsData
    });
  }

  /**
   * Chốt trạng thái ghế sau khi thanh toán thành công.
   */
  async updateSeatsToSold(seatIds, tx = prisma) {
    return tx.seats.updateMany({
      where: { id: { in: seatIds } },
      data: { status: 'SOLD' }
    });
  }

  /**
   * Hủy ghế nếu hết hạn giữ hoặc chủ động trả vé (Trả về trạng thái AVAILABLE)
   */
  async updateSeatsToAvailable(seatIds, tx = prisma) {
    return tx.seats.updateMany({
      where: { id: { in: seatIds } },
      data: {
        status: 'AVAILABLE',
        locked_by: null,
        locked_at: null
      }
    });
  }
}

module.exports = new BookingRepository();