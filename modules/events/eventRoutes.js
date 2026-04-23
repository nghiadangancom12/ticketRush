const express = require('express');
const router = express.Router();
const eventController = require('./eventController');
const { verifyToken, restrictTo } = require('../auth/auth.middleware');
const validate = require('../../utils/validate');
const eventSchema = require('./eventSchema');
const { verifyQueueAccess } = require('../queue/queueMiddleware');

router.get('/', eventController.getAll);
router.get('/:id', verifyToken,  eventController.getOne);
router.post('/', verifyToken, restrictTo('ADMIN'), validate(eventSchema.createEventSchema), eventController.createEvents);
router.patch('/:id/image', verifyToken, restrictTo('ADMIN'), validate(eventSchema.updateImageSchema), eventController.updateImage);

module.exports = router;
