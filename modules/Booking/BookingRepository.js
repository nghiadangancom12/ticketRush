const prisma = require('../../config/database');
const { Prisma } = require('@prisma/client');

class BookingRepository {
  // ==========================================
  // CÁC HÀM MỚI BỔ SUNG ĐỂ HỖ TRỢ SERVICE
  // ==========================================

  /**
   * Khóa bản ghi User để chống spam click / concurrent requests
   */
  async lockUser(userId, tx = prisma) {
    return tx.$queryRaw`SELECT id FROM "users" WHERE id = ${userId}::uuid FOR UPDATE`;
  }

  /**
   * Lấy thông tin Event
   */
  async getEventById(eventId, tx = prisma) {
    return tx.events.findUnique({
      where: { id: eventId }
    });
  }

  /**
   * Đếm số vé User đang giữ (TRỪ những vé đang thao tác)
   */
  async countOtherSeatsHeld(userId, eventId, uniqueSeatIds, tx = prisma) {
    return tx.seats.count({
      where: {
        locked_by: userId,
        zones: { event_id: eventId },
        status: { in: ['LOCKED', 'SOLD'] },
        id: { notIn: uniqueSeatIds } // Loại trừ các ghế đang cố gắng chọn
      }
    });
  }

  /**
   * Hủy ghế (Trả về trạng thái AVAILABLE)
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

  /**
   * Lấy ra danh sách các ghế cụ thể mà User ĐANG GIỮ để hủy.
   * Lọc bỏ những ghế không phải của User này hoặc không ở trạng thái LOCKED.
   */
  async checkSpecificSeatsToReturn(userId, eventId, seatIds, tx = prisma) {
    return tx.seats.findMany({
      where: {
        id: { in: seatIds },
        locked_by: userId,
        status: 'LOCKED',
        zones: { event_id: eventId }
      },
      select: { id: true }
    });
  }

  // ==========================================
  // CÁC HÀM HIỆN CÓ CỦA BẠN (Đã tối ưu)
  // ==========================================

  /**
   * Đếm số ghế User đang chiếm giữ (LOCKED hoặc SOLD) trong một sự kiện.
   */
  async countUserSeatsInEvent(userId, eventId, tx = prisma) {
    return tx.seats.count({
      where: {
        locked_by: userId,
        zones: { event_id: eventId },
        status: { in: ['LOCKED', 'SOLD'] }
      }
    });
  }

  /**
   * Sử dụng SELECT FOR UPDATE để khóa hàng (Row-level locking).
   * Chống Race Condition cực kỳ quan trọng trong đặt vé.
   */
  async getSeatsForUpdate(seatIds, tx = prisma) {
    return tx.$queryRaw`
      SELECT id, status, locked_by 
      FROM "seats"
      WHERE id IN (${Prisma.join(seatIds)})
      FOR UPDATE
    `;
  }

  /**
   * Cập nhật trạng thái ghế sang LOCKED.
   */
  async updateSeatsToLocked(seatIds, userId, lockedAt, tx = prisma) {
    return tx.seats.updateMany({
      where: { id: { in: seatIds } },
      data: {
        status: 'LOCKED',
        locked_by: userId,
        locked_at: lockedAt
      }
    });
  }

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
        zones: true // Để lấy giá tiền từ zone
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
   * Tạo vé (Bulk Insert sẽ tốt hơn nếu tạo nhiều vé cùng lúc).
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
}

module.exports = new BookingRepository();