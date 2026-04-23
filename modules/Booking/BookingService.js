const prisma = require('../../config/database');
const AppError = require('../errorHandling/AppError');
const { seatReleaseQueue, emailQueue } = require('../jobs/queues');

class BookingService {
    async holdSeats(userId, eventId, seatIds) {
        return await prisma.$transaction(async (tx) => {
            // 1. NGHIỆP VỤ: Kiểm tra tổng số vé User đang giữ trong Event này
            const event = await tx.events.findUnique({
                where: { id: eventId }
            });
            if (!event) throw new AppError('Sự kiện không tồn tại.', 404);
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

            // 3. Cập nhật trạng thái ghế → LOCKED
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

        // 4. Sau khi transaction thành công: đẩy Delayed Job vào BullMQ
        //    Job này sẽ tự động chạy sau 60 giây nếu user chưa thanh toán.
        //    (Đặt ngoài transaction để tránh delay ảnh hưởng đến DB lock)
    }

    /**
     * holdSeats không thể đẩy job bên trong transaction vì transaction
     * là async và job cần biết kết quả thành công của transaction.
     * Nên ta override lại flow ở Controller hoặc tách hàm helper.
     *
     * Giải pháp: Tách logic enqueue ra một hàm riêng để BookingController gọi
     * sau khi holdSeats() resolve thành công.
     */
    async scheduleRelease(userId, eventId, seatIds) {
        await seatReleaseQueue.add(
            'release-seats',
            { userId, eventId, seatIds },
            {
                delay: 60 * 1000, // 60 giây
                attempts: 3,
                backoff: { type: 'exponential', delay: 2000 },
            }
        );
        console.log(`[BullMQ] ⏰ Đã lên lịch nhả ghế sau 60s cho user ${userId}, seatIds: [${seatIds.join(', ')}]`);
    }

    async checkout(userId, eventId) {
        const result = await prisma.$transaction(async (tx) => {
            // 1. NGHIỆP VỤ: Lấy các ghế đang LOCKED của user trong event này.
            // Lưu ý: KHÔNG lọc theo locked_at ở đây — BullMQ seatReleaseWorker
            // đã chịu trách nhiệm tự động nhả ghế sau 60 giây.
            // Lọc theo thời gian sẽ gây 400 sai nếu có clock drift hay checkout
            // được gọi khi đang ở biên giới 1 phút.
            const lockedSeats = await tx.seats.findMany({
                where: {
                    locked_by: userId,
                    status: 'LOCKED',
                    zones: { event_id: eventId },
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

            // 4. Chốt ghế → SOLD
            await tx.seats.updateMany({
                where: { id: { in: lockedSeats.map(s => s.id) } },
                data: { status: 'SOLD' }
            });

            return { order: newOrder, seats: lockedSeats.map(s => s.id) };
        });

        // 5. Đẩy job gửi email vào BullMQ (không block HTTP response)
        await emailQueue.add(
            'send-ticket-email',
            { orderId: result.order.id },
            {
                attempts: 3,
                backoff: { type: 'exponential', delay: 2000 },
            }
        );
        console.log(`[BullMQ] 📧 Đã đẩy job gửi email cho đơn hàng: ${result.order.id}`);

        // 6. Giải phóng Virtual Queue Slot sớm cho người tiếp theo
        try {
            const queueService = require('../queue/queueService');
            await queueService.removeAllowed(eventId, userId);
        } catch (err) {
            console.error('Lỗi khi xoá queue allowed:', err.message);
        }

        return result;
    }
    /**
     * Trả ghế — Nhả tất cả ghế LOCKED của user trong event về AVAILABLE.
     * Được gọi khi user bấm "Huỷ" hoặc "Quay lại" từ trang Checkout.
     * Đồng thời giải phóng slot Active Queue để người tiếp theo được vào.
     */
    async returnSeats(userId, eventId) {
        return await prisma.$transaction(async (tx) => {
            // 1. Tìm tất cả ghế đang bị lock bởi user này trong event này
            const lockedSeats = await tx.seats.findMany({
                where: {
                    locked_by: userId,
                    status: 'LOCKED',
                    zones: { event_id: eventId }
                },
                select: { id: true }
            });

            if (lockedSeats.length === 0) {
                return { releasedIds: [] };
            }

            const ids = lockedSeats.map(s => s.id);

            // 2. Nhả ghế về AVAILABLE
            await tx.seats.updateMany({
                where: { id: { in: ids } },
                data: {
                    status: 'AVAILABLE',
                    locked_by: null,
                    locked_at: null
                }
            });

            return { releasedIds: ids };
        }).then(async (result) => {
            // 3. Sau khi DB commit: giải phóng slot Active Queue
            //    → người tiếp theo trong hàng chờ sẽ được QueueWorker đẩy vào
            if (result.releasedIds.length > 0) {
                try {
                    const queueService = require('../queue/queueService');
                    await queueService.removeAllowed(eventId, userId);
                    console.log(`[Booking] ↩️  User ${userId} trả ${result.releasedIds.length} ghế + giải phóng queue slot.`);
                } catch (err) {
                    console.error('[Booking] Lỗi giải phóng queue slot:', err.message);
                }
            }
            return result;
        });
    }
}

module.exports = new BookingService();