const axios = require('axios');
const AppError = require('../modules/errorHandling/AppError');

exports.verifyQueueAccess = async (req, res, next) => {
  try {
    // Lấy eventId linh hoạt từ nhiều nguồn (Safely parse với optional chaining)
    const eventId = req.body?.eventId || req.params?.id || req.params?.eventId || req.query?.eventId;

    if (!eventId) {
      return next();
    }

    const userId = req.user.id;
    const queueServiceUrl = process.env.QUEUE_SERVICE_URL || 'http://localhost:3001';

    try {
      // Ép timeout nội bộ thật thấp để tránh hiệu ứng Domino (Cascading Failure)
      const response = await axios.get(`${queueServiceUrl}/api/queue/${eventId}/session/${userId}`, {
        timeout: 1000, 
      });

      // Rút gọn logic kiểm tra data
      if (response.data?.data?.isAllowed) {
        return next();
      } else {
        return next(new AppError('Bạn chưa đến lượt hoặc phiên giao dịch đã hết hạn. Vui lòng quay lại xếp hàng!', 403));
      }
    } catch (httpErr) {
      // 🚨 CẮT BỎ HOÀN TOÀN FALLBACK MONOLITH Ở ĐÂY
      console.error(`[QueueMiddleware] Lỗi gọi sang QueueService cho user ${userId}:`, httpErr.message);

      // Nếu lỗi từ Queue Service trả về 4xx/5xx có body
      if (httpErr.response && httpErr.response.status === 403) {
         return next(new AppError('Bạn chưa đến lượt hoặc phiên giao dịch đã hết hạn!', 403));
      }

      // Fail-Closed: Nếu sập mạng nội bộ hoặc timeout, từ chối cho vào!
      return next(new AppError('Hệ thống xếp hàng đang bận hoặc gián đoạn. Vui lòng thử lại!', 503));
    }
  } catch (error) {
    next(error);
  }
};