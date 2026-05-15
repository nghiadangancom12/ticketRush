const prisma = require('../../config/database');
const AppError = require('../errorHandling/AppError');
const bookingRepo = require('./BookingRepository'); // Import file Repository đã tối ưu
const queueService = require('../queue/queueService');
const { seatReleaseQueue, emailQueue } = require('../jobs/queues');

class BookingService {
    async holdSeats(userId, eventId, seatIds) {
        // Lọc trùng lặp ID ghế ngay từ đầu
        const uniqueSeatIds = [...new Set(seatIds)];

        return await prisma.$transaction(async (tx) => {
            // 🌟 1. CHỐT CHẶN HACKER: Khóa User Record (Ủy quyền cho Repo)
            await bookingRepo.lockUser(userId, tx);

            // 2. NGHIỆP VỤ: Kiểm tra Event
            const event = await bookingRepo.getEventById(eventId, tx);
            if (!event) throw new AppError('Sự kiện không tồn tại.', 404);

            // 🌟 3. LỖI ĐẾM VÉ: Kiểm tra giới hạn vé
            const otherSeatsUserHolds = await bookingRepo.countOtherSeatsHeld(userId, eventId, uniqueSeatIds, tx);
            if (otherSeatsUserHolds + uniqueSeatIds.length > 4) {
                throw new AppError('Bạn chỉ được giữ/mua tổng cộng tối đa 4 vé trong 1 sự kiện.', 400);
            }

            // 4. NGHIỆP VỤ: Khóa ghế và kiểm tra trạng thái
            const lockedSeatsQuery = await bookingRepo.getSeatsForUpdate(uniqueSeatIds, tx);

            if (lockedSeatsQuery.length !== uniqueSeatIds.length) {
                throw new AppError('Một hoặc nhiều ghế không tồn tại hoặc không hợp lệ.', 400);
            }

            // Xử lý Re-hold thông minh
            const unavailable = lockedSeatsQuery.filter(s => {
                if (s.status === 'AVAILABLE') return false;
                if (s.status === 'LOCKED' && String(s.locked_by) === String(userId)) return false;
                return true;
            });
            
            if (unavailable.length > 0) {
                throw new AppError('Một hoặc nhiều ghế đã bị người khác giữ. Vui lòng chọn ghế khác.', 400);
            }

            // 5. Cập nhật trạng thái ghế → LOCKED
            await bookingRepo.updateSeatsToLocked(uniqueSeatIds, userId, new Date(), tx);

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
            // 🌟 CHỐT CHẶN 1: Khóa User
            await bookingRepo.lockUser(userId, tx);

            // 1. Tìm ghế đang LOCKED
            const lockedSeats = await bookingRepo.getLockedSeatsForCheckout(userId, eventId, tx);

            if (lockedSeats.length === 0) {
                throw new AppError('Bạn không có vé nào đang giữ hoặc vé đã hết hạn thanh toán.', 400);
            }

            // 🌟 CHỐT CHẶN 2: Khóa Ghế ngay lập tức bằng Row-Level Locking
            const seatIds = lockedSeats.map(s => s.id);
            await bookingRepo.getSeatsForUpdate(seatIds, tx); // Tái sử dụng hàm lấy ghế + FOR UPDATE

            // 2. Tính tiền và tạo Đơn hàng
            const totalAmount = lockedSeats.reduce((sum, seat) => sum + Number(seat.zones.price), 0);
            const newOrder = await bookingRepo.createOrder(userId, eventId, totalAmount, tx);

            // 3. In Vé (Chuẩn bị Data cho Bulk Insert)
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
            await bookingRepo.createTickets(ticketData, tx);

            // 4. Chốt ghế → SOLD
            await bookingRepo.updateSeatsToSold(seatIds, tx);

            return { order: newOrder, seats: seatIds };
        });

        // 5. Đẩy job gửi email vào BullMQ (Ngoài Transaction)
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
            await queueService.removeAllowed(eventId, userId);
        } catch (err) {
            console.error('Lỗi khi xoá queue allowed:', err.message);
        }

        return result;
    }

    async returnSeats(userId, eventId) {
        return await prisma.$transaction(async (tx) => {
            // Khóa User nhẹ nhàng
            await bookingRepo.lockUser(userId, tx);

            const lockedSeats = await bookingRepo.getLockedSeatsForCheckout(userId, eventId, tx); // Tái sử dụng hàm

            if (lockedSeats.length === 0) {
                return { releasedIds: [] };
            }

            const ids = lockedSeats.map(s => s.id);

            // Trả ghế về AVAILABLE
            await bookingRepo.updateSeatsToAvailable(ids, tx);

            return { releasedIds: ids };
        }).then(async (result) => {
            if (result.releasedIds.length > 0) {
                try {
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