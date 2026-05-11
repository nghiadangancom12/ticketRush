const prisma = require('../../config/database');
const AppError = require('../errorHandling/AppError');
const { seatReleaseQueue, emailQueue } = require('../jobs/queues');

class BookingService {
    async holdSeats(userId, eventId, seatIds) {
        // Lọc trùng lặp ID ghế ngay từ đầu
        const uniqueSeatIds = [...new Set(seatIds)];

        return await prisma.$transaction(async (tx) => {
            // 🌟 1. CHỐT CHẶN HACKER: Khóa User Record lại (Chống 1 người bắn 10 API lách luật)
            await tx.$queryRaw`SELECT id FROM "users" WHERE id = ${userId}::uuid FOR UPDATE`;

            // 2. NGHIỆP VỤ: Kiểm tra Event
            const event = await tx.events.findUnique({
                where: { id: eventId }
            });
            if (!event) throw new AppError('Sự kiện không tồn tại.', 404);

            // 🌟 3. FIX LỖI ĐẾM VÉ: Chỉ đếm những vé User đang giữ MÀ KHÔNG NẰM TRONG mảng uniqueSeatIds
            const otherSeatsUserHolds = await tx.seats.count({
                where: {
                    locked_by: userId,
                    zones: { event_id: eventId },
                    status: { in: ['LOCKED', 'SOLD'] },
                    id: { notIn: uniqueSeatIds }
                }
            });

            if (otherSeatsUserHolds + uniqueSeatIds.length > 4) {
                throw new AppError('Bạn chỉ được giữ/mua tổng cộng tối đa 4 vé trong 1 sự kiện.', 400);
            }

            // 4. NGHIỆP VỤ: Row-Level Locking chống Double-booking
            const placeholders = uniqueSeatIds.map((_, i) => `$${i + 1}::uuid`).join(', ');
            const query = `
                SELECT id, status, locked_by FROM "seats"
                WHERE id IN (${placeholders})
                FOR UPDATE
            `;
            const lockedSeatsQuery = await tx.$queryRawUnsafe(query, ...uniqueSeatIds);

            if (lockedSeatsQuery.length !== uniqueSeatIds.length) {
                throw new AppError('Một hoặc nhiều ghế không tồn tại hoặc không hợp lệ.', 400);
            }

            // Xử lý Re-hold thông minh (Chống React StrictMode double call)
            const unavailable = lockedSeatsQuery.filter(s => {
                if (s.status === 'AVAILABLE') return false;
                if (s.status === 'LOCKED' && String(s.locked_by) === String(userId)) return false;
                return true;
            });
            
            if (unavailable.length > 0) {
                throw new AppError('Một hoặc nhiều ghế đã bị người khác giữ. Vui lòng chọn ghế khác.', 400);
            }

            // 5. Cập nhật trạng thái ghế → LOCKED
            await tx.seats.updateMany({
                where: { id: { in: uniqueSeatIds } },
                data: {
                    status: 'LOCKED',
                    locked_by: userId,
                    locked_at: new Date()
                }
            });

            return uniqueSeatIds;
        });
    }

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
        console.log(`[BullMQ] ⏰ Đã lên lịch nhả ghế sau 60s cho user ${userId}`);
    }

    async checkout(userId, eventId) {
        const result = await prisma.$transaction(async (tx) => {
            // 🌟 CHỐT CHẶN 1: Khóa User (Chống Double-click sinh ra 2 đơn hàng)
            await tx.$queryRaw`SELECT id FROM "users" WHERE id = ${userId}::uuid FOR UPDATE`;

            // 1. Tìm ghế đang LOCKED
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

            // 🌟 CHỐT CHẶN 2: Khóa Ghế ngay lập tức (Chống BullMQ nhảy vào nhả ghế lúc đang thanh toán)
            const seatIds = lockedSeats.map(s => s.id);
            const placeholders = seatIds.map((_, i) => `$${i + 1}::uuid`).join(', ');
            await tx.$queryRawUnsafe(`
                SELECT id FROM "seats" 
                WHERE id IN (${placeholders}) 
                FOR UPDATE
            `, ...seatIds);

            // 2. Tính tiền và tạo Đơn hàng
            const totalAmount = lockedSeats.reduce((sum, seat) => sum + Number(seat.zones.price), 0);

            const newOrder = await tx.orders.create({
                data: {
                    total_amount: totalAmount,
                    status: 'PAID',
                    users: { connect: { id: userId } },
                    events: { connect: { id: eventId } }
                }
            });

            // 3. In Vé (Bulk Insert)
            const ticketData = lockedSeats.map(seat => {
                const randomStr = Math.random().toString(36).substring(2, 10).toUpperCase();
                const ticketCode = `TR-${randomStr.substring(0, 4)}-${randomStr.substring(4, 8)}`;
                return {
                    order_id: newOrder.id,
                    seat_id: seat.id,
                    qr_code: ticketCode,
                    status: 'UNUSED'
                };
            });
            await tx.tickets.createMany({ data: ticketData });

            // 4. Chốt ghế → SOLD
            await tx.seats.updateMany({
                where: { id: { in: seatIds } },
                data: { status: 'SOLD' }
            });

            return { order: newOrder, seats: seatIds };
        });

        // 5. Đẩy job gửi email vào BullMQ
        await emailQueue.add(
            'send-ticket-email',
            { orderId: result.order.id },
            {
                attempts: 3,
                backoff: { type: 'exponential', delay: 2000 },
            }
        );
        console.log(`[BullMQ] 📧 Đã đẩy job gửi email cho đơn: ${result.order.id}`);

        // 6. Giải phóng Virtual Queue Slot
        try {
            const queueService = require('../queue/queueService');
            await queueService.removeAllowed(eventId, userId);
        } catch (err) {
            console.error('Lỗi khi xoá queue allowed:', err.message);
        }

        return result;
    }

    async returnSeats(userId, eventId) {
        return await prisma.$transaction(async (tx) => {
            // Khóa User nhẹ nhàng để chống spam click nút Hủy
            await tx.$queryRaw`SELECT id FROM "users" WHERE id = ${userId}::uuid FOR UPDATE`;

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
            if (result.releasedIds.length > 0) {
                try {
                    const queueService = require('../queue/queueService');
                    await queueService.removeAllowed(eventId, userId);
                    console.log(`[Booking] ↩️  User ${userId} trả ${result.releasedIds.length} ghế.`);
                } catch (err) {
                    console.error('[Booking] Lỗi giải phóng queue slot:', err.message);
                }
            }
            return result;
        });
    }
}

module.exports = new BookingService();