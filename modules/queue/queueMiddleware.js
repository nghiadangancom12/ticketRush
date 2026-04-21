const AppError = require('../errorHandling/AppError');
const queueService = require('./queueService');

exports.verifyQueueAccess = async (req, res, next) => {
  try {
    const { eventId } = req.body; // Lưu ý: Checkout đôi khi không có eventId ở body mà lấy từ params/query, hãy cẩn thận chỗ này nhé!
    
    // 1. Nếu không có eventId, nhường cho Zod hoặc Controller xử lý lỗi
    if (!eventId) {
      return next(); 
    }

    // 2. Nếu Queue đang TẮT -> Cho đi thẳng vào mua vé
    const isActive = await queueService.isQueueActive(eventId);
    if (!isActive) {
      return next(); 
    }

    // 3. Nếu Queue đang BẬT -> Kiểm tra xem có mặt trong phòng Active không
    const userId = req.user.id;
    const isAllowed = await queueService.hasActiveSession(eventId, userId);

    if (!isAllowed) {
      return next(new AppError('Bạn chưa đến lượt hoặc phiên giao dịch đã hết hạn. Vui lòng quay lại xếp hàng!', 403));
    }

    // Hợp lệ, cho phép qua cửa để vào BookingService
    next();
  } catch (error) {
    next(error);
  }
};