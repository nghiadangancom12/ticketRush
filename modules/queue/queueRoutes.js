const express = require('express');
const router = express.Router();
const queueController = require('./queueController');
const joinQueueLimiter = require('../../utils/rateLimiter');
const { verifyToken, restrictTo } = require('../auth/auth.middleware');

// 1. Dành cho User: Xin xếp hàng & Cập nhật vị trí (Dùng POST hoặc GET đều được, nhưng POST phổ biến hơn cho action 'join')
router.post('/:eventId/join', verifyToken,joinQueueLimiter,queueController.joinQueue);

// 2. Dành cho User: Chủ động thoát hàng đợi
router.delete('/:eventId/leave', verifyToken, queueController.leaveQueue);

// 3. Dành cho Admin: Bật/Tắt chế độ xếp hàng
router.post('/admin/:eventId/toggle', verifyToken, restrictTo('ADMIN'), queueController.toggleQueue);
router.post('/test-join/:eventId',joinQueueLimiter, queueController.testJoinQueue);
module.exports = router;