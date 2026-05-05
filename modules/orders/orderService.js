const orderRepository = require('./orderRepository');
const AppError = require('../errorHandling/AppError');
const PrismaApiFeatures = require('../../utils/PrismaApiFeatures');

class OrderService {
  /**
   * GET ALL ORDERS (Admin only)
   */
  async getAllOrders(query) {
    if (query.eventId) {
      query.event_id = query.eventId;
      delete query.eventId;
    }

    const features = new PrismaApiFeatures(query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const prismaArgs = features.getArgs();
    const { page, limit } = features.getPagination();

    // 🌟 3. Gọi thẳng Repository, bỏ luôn cái tham số eventId thứ 2!
    const { data, total } = await orderRepository.findAll(prismaArgs);

    return {
      results: data.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data,
    };
  }

  /**
   * Lấy chi tiết 1 order theo ID
   */
  async getOrderById(orderId) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new AppError('Không tìm thấy đơn hàng', 404);
    return order;
  }
}

module.exports = new OrderService();