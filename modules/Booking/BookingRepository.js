const prisma = require('../../config/database-booking');
const { Prisma } = require('../../generated/prisma-booking');

class BookingRepository {
  // ==========================================
  // CÁC HÀM KÍCH HOẠT STORED PROCEDURE (Tối ưu tải cao)
  // ==========================================

  /**
   * Gọi Stored Procedure giữ ghế (Chống Race Condition & Deadlock)
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
   * Đã denormalize: đọc zone_name, zone_price trực tiếp từ seats (booking_db).
   */
  async getLockedSeatsForCheckout(userId, eventId, tx = prisma) {
    return tx.seats.findMany({
      where: {
        locked_by: userId,
        status: 'LOCKED',
        event_id: eventId
      }
    });
  }

  /**
   * Tạo đơn hàng mới.
   * Đã denormalize: snapshot event_title, category_name, user_email vào orders.
   */
  async createOrder(userId, eventId, totalAmount, snapshotData, tx = prisma) {
    return tx.orders.create({
      data: {
        user_id: userId,
        event_id: eventId,
        total_amount: totalAmount,
        event_title: snapshotData.event_title,
        category_name: snapshotData.category_name || null,
        user_email: snapshotData.user_email,
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

  /**
   * Lấy danh sách vé đã mua thành công của người dùng.
   * Đã denormalize: đọc zone_name, event_title trực tiếp từ booking_db.
   * KHÔNG còn JOIN xuyên sang catalog_db.
   */
  async getUserTickets(userId) {
    const tickets = await prisma.tickets.findMany({
      where: {
        orders: {
          user_id: userId,
          status: 'PAID'
        }
      },
      select: {
        id: true,
        qr_code: true,
        status: true,
        seats: {
          select: {
            seat_number: true,
            row_label: true,
            zone_name: true,
            zone_price: true,
            event_id: true
          }
        },
        orders: {
          select: {
            event_title: true,
            event_id: true
          }
        }
      },
      orderBy: {
        issued_at: 'desc'
      }
    });

    return tickets.map(t => ({
      id: t.id,
      qr_code: t.qr_code,
      status: t.status,
      seat_number: t.seats.seat_number,
      row_label: t.seats.row_label,
      zone_name: t.seats.zone_name,
      event: {
        id: t.orders.event_id,
        title: t.orders.event_title,
      }
    }));
  }

  /**
   * Lấy lịch sử mua hàng của user (phục vụ API Composition từ user-service).
   */
  async getPurchaseHistory(userId) {
    return prisma.orders.findMany({
      where: { user_id: userId },
      include: {
        tickets: {
          include: {
            seats: {
              select: {
                id: true,
                seat_number: true,
                row_label: true,
                zone_name: true,
                zone_price: true,
                event_id: true
              }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  /**
   * Lấy danh sách ghế đang giữ của user (phục vụ API Composition).
   */
  async getLockedSeatsByUser(userId) {
    return prisma.seats.findMany({
      where: { locked_by: userId, status: 'LOCKED' },
      select: {
        id: true,
        seat_number: true,
        row_label: true,
        zone_name: true,
        zone_price: true,
        event_id: true,
        locked_at: true
      }
    });
  }

  /**
   * Tạo seats hàng loạt (phục vụ provision-seats từ event-catalog-service).
   * Seats đã được denormalize với zone_name, zone_price, event_id.
   */
  async createManySeats(seatsData) {
    if (seatsData.length === 0) return { count: 0 };
    return prisma.seats.createMany({ data: seatsData });
  }
}

module.exports = new BookingRepository();