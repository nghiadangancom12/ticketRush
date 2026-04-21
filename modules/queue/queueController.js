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

// Admin bật/tắt hàng đợi ảo
exports.toggleQueue = catchAsync(async (req, res) => {
  const { eventId } = req.params;
  const { isActive } = req.body;

  const result = await queueService.toggleQueue(eventId, isActive);
  const statusStr = isActive ? 'Bật' : 'Tắt';
  return ResponseFactory.success(res, result, `Đã ${statusStr} Virtual Queue cho sự kiện ${eventId}`);
});