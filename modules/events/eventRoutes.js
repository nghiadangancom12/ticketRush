const express = require('express');
const router = express.Router();
const eventController = require('./eventController');
const { verifyToken, restrictTo } = require('../../middlewares/authMiddleware');
const { verifyQueueAccess } = require('../../middlewares/queueMiddleware');
const validate = require('../../utils/validate');
const eventSchema = require('./eventSchema');
const { uploadSingleImage } = require('../../middlewares/uploadImageMiddleware');

router.get('/', eventController.getAll);
router.get('/:id', verifyToken, verifyQueueAccess, eventController.getOne);
router.post('/', verifyToken, restrictTo('ADMIN'), validate(eventSchema.createEventSchema), eventController.createEvents);

// PATCH /:id/image — Upload ảnh event (multipart/form-data, field name: "image")
router.patch(
  '/:id/image',
  verifyToken,
  restrictTo('ADMIN'),
  uploadSingleImage('image'),  // Multer: đọc + validate file, lưu buffer vào RAM
  eventController.updateImage  // Controller: Sharp resize/compress → lưu ổ cứng → update DB
);

router.delete('/:id', verifyToken, restrictTo('ADMIN'), eventController.deleteEvent);

module.exports = router;
