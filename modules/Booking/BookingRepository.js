const prisma = require('../../config/database');
const { Prisma } = require('@prisma/client');

let holdProcedureUnavailable = false;

function isMissingHoldProcedureError(error) {
  const parts = [
    error?.code,
    error?.meta?.code,
    error?.message,
    error?.meta?.message,
    error?.meta?.cause
  ]
    .filter(Boolean)
    .map((part) => String(part).toLowerCase());

  const text = parts.join(' ');
  return text.includes('hold_seats_procedure')
    && (text.includes('does not exist') || text.includes('undefined_function') || text.includes('42883'));
}

class BookingRepository {
  // ==========================================
  // CÁC HÀM KÍCH HOẠT STORED PROCEDURE (Tối ưu tải cao)
  // ==========================================

  /**
   * Gọi Stored Procedure giữ ghế dưới Neon DB (Chống Race Condition & Deadlock)
   */
  async holdSeatsViaProcedure(userId, eventId, seatIds, tx = prisma) {
    if (holdProcedureUnavailable) {
      return this.holdSeatsViaTransaction(userId, eventId, seatIds, tx);
    }

    try {
      return await tx.$queryRaw`
        SELECT * FROM hold_seats_procedure(
          ${userId}::uuid, 
          ${eventId}::uuid, 
          ${seatIds}::uuid[] 
        )
      `;
    } catch (error) {
      if (!isMissingHoldProcedureError(error)) throw error;

      holdProcedureUnavailable = true;
      console.warn('[BookingRepository] hold_seats_procedure is missing; using transaction fallback.');
      return this.holdSeatsViaTransaction(userId, eventId, seatIds, tx);
    }
  }

  async holdSeatsViaTransaction(userId, eventId, seatIds, tx = prisma) {
    const run = async (client) => {
      const uniqueSeatIds = [...new Set((seatIds || []).filter(Boolean))];

      if (!userId || !eventId) {
        return [{ status: 'FAILED', message: 'Thong tin nguoi dung hoac su kien khong hop le.' }];
      }

      if (uniqueSeatIds.length === 0) {
        return [{ status: 'FAILED', message: 'Ban phai chon it nhat mot ghe.' }];
      }

      if (uniqueSeatIds.length > 4) {
        return [{ status: 'FAILED', message: 'Ban chi duoc giu toi da 4 ghe trong 1 su kien.' }];
      }

      const eventCount = await client.events.count({ where: { id: eventId } });
      if (eventCount === 0) {
        return [{ status: 'FAILED', message: 'Su kien khong ton tai.' }];
      }

      await client.$queryRaw`
        SELECT pg_advisory_xact_lock(hashtext(${`${userId}:${eventId}`})::bigint)
      `;

      const existingLocked = await client.seats.count({
        where: {
          locked_by: userId,
          status: 'LOCKED',
          zones: { event_id: eventId },
          id: { notIn: uniqueSeatIds }
        }
      });

      if (existingLocked + uniqueSeatIds.length > 4) {
        return [{ status: 'FAILED', message: 'Ban chi duoc giu toi da 4 ghe trong 1 su kien.' }];
      }

      const lockedRows = await client.$queryRaw`
        SELECT s.id, s.status
        FROM seats s
        JOIN zones z ON z.id = s.zone_id
        WHERE z.event_id = ${eventId}::uuid
          AND s.id = ANY(${uniqueSeatIds}::uuid[])
        ORDER BY s.id
        FOR UPDATE OF s
      `;

      if (lockedRows.length !== uniqueSeatIds.length) {
        return [{ status: 'FAILED', message: 'Mot hoac nhieu ghe khong thuoc su kien nay.' }];
      }

      if (lockedRows.some((seat) => seat.status !== 'AVAILABLE')) {
        return [{ status: 'FAILED', message: 'Mot hoac nhieu ghe da co nguoi giu hoac da ban.' }];
      }

      const updated = await client.seats.updateMany({
        where: {
          id: { in: uniqueSeatIds },
          status: 'AVAILABLE'
        },
        data: {
          status: 'LOCKED',
          locked_by: userId,
          locked_at: new Date()
        }
      });

      if (updated.count !== uniqueSeatIds.length) {
        return [{ status: 'FAILED', message: 'Mot hoac nhieu ghe da co nguoi giu hoac da ban.' }];
      }

      return [{ status: 'SUCCESS', message: 'Giu ghe thanh cong.' }];
    };

    if (tx !== prisma) return run(tx);

    return prisma.$transaction(run, {
      isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted
    });
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
