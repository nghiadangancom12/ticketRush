const catchAsync = require('../errorHandling/catchAsync');
const ResponseFactory = require('../../utils/ResponseFactory');
const orderService = require('./orderService');

/**
 * GET /api/orders  (Admin only)
 * Lấy danh sách tất cả đơn hàng, hỗ trợ lọc theo sự kiện và người mua.
 *
 * Query params:
 *   ?eventId=<uuid>            → Lọc theo sự kiện
 *   ?user_id=<uuid>            → Lọc theo người mua
 *   ?status=PAID               → Lọc theo trạng thái (PENDING | PAID | CANCELLED)
 *   ?sort=created_at:desc      → Sắp xếp
 *   ?page=1&limit=20           → Phân trang
 */
exports.getAllOrders = catchAsync(async (req, res) => {
  const result = await orderService.getAllOrders(req.query);
  ResponseFactory.success(res, result, 'Lấy danh sách đơn hàng thành công');
});

/**
 * GET /api/orders/:orderId  (Admin only)
 * Lấy chi tiết 1 đơn hàng cùng thông tin vé, ghế, zone và sự kiện.
 */
exports.getOrderById = catchAsync(async (req, res) => {
  const order = await orderService.getOrderById(req.params.orderId);
  ResponseFactory.success(res, order, 'Lấy chi tiết đơn hàng thành công');
});
