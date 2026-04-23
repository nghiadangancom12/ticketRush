const catchAsync = require('../errorHandling/catchAsync');
const ResponseFactory = require('../../utils/ResponseFactory');
const queueService = require('./queueService');

exports.joinQueue = catchAsync(async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user.id;

  // 1. Kiểm tra xem sự kiện có đang bật hàng đợi không
  const isActive = await queueService.isQueueActive(eventId);
  if (!isActive) {
    return ResponseFactory.success(res, { status: 'no_queue' }, 'Sự kiện này đang mở tự do, không yêu cầu xếp hàng.');
  }

  // 2. Xin xếp hàng (Hàm này dùng luôn cho việc Polling ping mỗi 5 giây)
  const result = await queueService.joinQueue(eventId, userId);
  
  if (result.status === 'allowed') {
    // Đã đến lượt -> Trả về 200 OK
    return ResponseFactory.success(res, result, 'Bạn đã có quyền vào trang mua vé!');
  }

  // Đang xếp hàng -> Nên trả về mã 202 Accepted
  // (Nếu ResponseFactory của bạn không hỗ trợ set status code, bạn có thể dùng thẳng res.status(202).json(...))
  return res.status(202).json({
    status: 'success',
    data: result,
    message: `Bạn đang ở vị trí thứ ${result.position} trong hàng đợi. Vui lòng không tải lại trang...`
  });
});

// User chủ động rời hàng đợi (Hoặc hủy mua vé)
exports.leaveQueue = catchAsync(async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user.id;

  await queueService.removeAllowed(eventId, userId);
  return ResponseFactory.success(res, null, 'Đã rời khỏi hàng đợi thành công.');
});
exports.testJoinQueue = catchAsync(async (req, res) => {
  const { eventId } = req.params;
  
  // Tự động sinh ra một userId giả (ví dụ: test_user_12345)
  const fakeUserId = `test_user_${Math.floor(Math.random() * 100000)}`;

  const isActive = await queueService.isQueueActive(eventId);
  if (!isActive) {
      return res.status(200).json({ status: 'no_queue' });
  }

  const result = await queueService.joinQueue(eventId, fakeUserId);
  
  return res.status(202).json({
    status: 'success',
    data: result
  });
});
// Admin bật/tắt hàng đợi ảo
exports.toggleQueue = catchAsync(async (req, res) => {
  const { eventId } = req.params;
  const { isActive } = req.body;

  const result = await queueService.toggleQueue(eventId, isActive);
  const statusStr = isActive ? 'Bật' : 'Tắt';
  return ResponseFactory.success(res, result, `Đã ${statusStr} Virtual Queue cho sự kiện ${eventId}`);
});

/**
 * POST /api/queue/:eventId/heartbeat
 * Frontend gọi mỗi 15 giây khi đang trên trang chọn ghế.
 * Nếu không ping -> session hết hạn sau 20s -> người tiếp theo được vào.
 * Trả về 410 Gone nếu session đã bị đuổi (để frontend biết và điều hướng về queue).
 */
exports.heartbeat = catchAsync(async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user.id;

  const result = await queueService.heartbeat(eventId, userId);

  if (!result.alive) {
    // 1. Phân loại lời nhắn dựa trên lý do "tử hình" từ QueueService
    const customMessage = result.reason === 'TIMEOUT'
      ? 'Đã hết thời gian 10 phút giữ ghế. Vui lòng quay lại hàng chờ.'
      : 'Phiên giao dịch mất kết nối quá lâu. Vui lòng quay lại hàng chờ.';

    // Trả về 410 Gone kèm theo lý do cụ thể
    return res.status(410).json({
      status: 'fail',
      reason: result.reason, // Frontend có thể dùng biến này để log lỗi
      message: customMessage
    });
  }

  // 2. Trả thêm hardTimeoutLeft về cho Frontend cập nhật đồng hồ
  return ResponseFactory.success(res, {
    alive: true,
    expiresAt: result.expiresAt,         // Hạn của nhịp tim (20s)
    hardTimeoutLeft: result.hardTimeoutLeft // Số mili-giây còn lại của 10 phút
  }, 'Phiên hoạt động đã được gia hạn.');
});