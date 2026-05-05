const express = require('express');
const router = express.Router();
const orderController = require('./orderController');
const { verifyToken, restrictTo } = require('../../middlewares/authMiddleware');
const validate = require('../../utils/validate');
const orderSchema = require('./orderSchema');

// Tất cả routes trong module này đều yêu cầu đăng nhập và quyền ADMIN
router.use(verifyToken, restrictTo('ADMIN'));

// GET /api/orders         — danh sách tất cả orders (có filter, sort, paginate)
router.get('/', validate(orderSchema.getAllOrdersSchema), orderController.getAllOrders);

// GET /api/orders/:orderId — chi tiết 1 order
router.get('/:orderId', orderController.getOrderById);

module.exports = router;

