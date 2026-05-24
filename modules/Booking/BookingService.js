const prisma = require('../../config/database');
const AppError = require('../errorHandling/AppError');
const bookingRepo = require('./BookingRepository'); 
const queueService = require('../queue/queueService');
const { seatReleaseQueue, emailQueue } = require('../jobs/queues');

class BookingService {
    /**
     * GIỮ GHẾ (Đã chuyển sang Stored Procedure tối ưu < 2ms)
     */
    async holdSeats(userId, eventId, seatIds) {
        // 1. Khử trùng lặp phần tử mảng ngay từ đầu
        const uniqueSeatIds = [...new Set(seatIds)];

        try {
            // 2. Ủy quyền thực thi cho Stored Procedure dưới Neon DB thông qua Repository
            const result = await bookingRepo.holdSeatsViaProcedure(userId, eventId, uniqueSeatIds);
            const dbResult = result[0];

            // 3. Xử lý kết quả trả về từ database
            if (dbResult.status === 'SUCCESS') {
                // Trả về mảng các ID ghế đã được giữ thành công
                return uniqueSeatIds;
            } else {
                // Bắn lỗi nghiệp vụ chính xác (Ví dụ: vượt quá 4 vé, hoặc ghế đã có người giữ)
                throw new AppError(dbResult.message, 400);
            }

        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error('[BookingService Error]:', error.message);
            throw new AppError('Hệ thống bận, không thể thực hiện giữ ghế lúc này.', 500);
        }
    }

    /**
     * Đặt lịch nhả ghế tự động qua BullMQ nếu quá thời gian thanh toán
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
        console.log(`[BullMQ] ⏰ Đã lên lịch nhả ghế sau 60s cho user ${userId}`);
    }

    /**
     * THANH TOÁN & XUẤT VÉ (Giai đoạn chốt sổ - Đã có sẵn Row-level locking)
     */
    async checkout(userId, eventId) {
        const result = await prisma.$transaction(async (tx) => {
            // Kiểm tra và lấy danh sách ghế đang giữ
            const lockedSeats = await bookingRepo.getLockedSeatsForCheckout(userId, eventId, tx);

            if (lockedSeats.length === 0) {
                throw new AppError('Bạn không có vé nào đang giữ hoặc vé đã hết hạn thanh toán.', 400);
            }

            const seatIds = lockedSeats.map(s => s.id);
            
            // Tính tiền và tạo Đơn hàng
            const totalAmount = lockedSeats.reduce((sum, seat) => sum + Number(seat.zones.price), 0);
            const newOrder = await bookingRepo.createOrder(userId, eventId, totalAmount, tx);

            // Sinh mã QR và tạo bản ghi Vé (Bulk Insert)
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

            // Chốt cứng trạng thái ghế sang SOLD
            await bookingRepo.updateSeatsToSold(seatIds, tx);

            return { order: newOrder, seats: seatIds };
        });

        // Đẩy tác vụ gửi mail ra nền (Background) bên ngoài Transaction
        await emailQueue.add(
            'send-ticket-email',
            { orderId: result.order.id },
            {
                attempts: 3,
                backoff: { type: 'exponential', delay: 2000 },
            }
        );
        console.log(`[BullMQ] 📧 Đã đẩy job gửi email cho đơn: ${result.order.id}`);

        // Giải phóng Slot trong phòng mua vé ảo của Redis
        try {
            await queueService.removeAllowed(eventId, userId);
        } catch (err) {
            console.error('Lỗi khi xoá queue allowed:', err.message);
        }

        return result;
    }

    /**
     * CHỦ ĐỘNG TRẢ Vé / HUỶ THAO TÁC
     */
    async returnSeats(userId, eventId) {
        return await prisma.$transaction(async (tx) => {
            const lockedSeats = await bookingRepo.getLockedSeatsForCheckout(userId, eventId, tx); 

            if (lockedSeats.length === 0) {
                return { releasedIds: [] };
            }

            const ids = lockedSeats.map(s => s.id);

            // Nhả ghế về AVAILABLE
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