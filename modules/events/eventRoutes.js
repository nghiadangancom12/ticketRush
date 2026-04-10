const express = require('express');
const router = express.Router();
const eventController = require('./eventController');
const { verifyToken, isAdmin } = require('../auth/auth.middleware');

router.get('/', eventController.getAll);
router.get('/:id', eventController.getOne);
router.post('/', verifyToken, isAdmin, eventController.createEvents);
router.patch('/:id/image', verifyToken, isAdmin, eventController.updateImage);

module.exports = router;
