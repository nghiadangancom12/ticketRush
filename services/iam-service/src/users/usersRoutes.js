const express = require('express');
const router = express.Router();
const usersController = require('./usersController');
const { verifyToken, restrictTo } = require('../../../shared/middlewares/authMiddleware');
const usersSchema = require('./usersSchema');
const validate = require('../../../shared/utils/validate');
const { uploadSingleImage } = require('../../../shared/middlewares/uploadImageMiddleware');

// Admin-only routes
router.get('/', verifyToken, restrictTo('ADMIN'), validate(usersSchema.getAllUserSchema), usersController.getAllUsers);
router.patch('/:userId/grant-admin', verifyToken, restrictTo('ADMIN'), usersController.grantAdminRole);
router.patch('/:userId/revoke-admin', verifyToken, restrictTo('ADMIN'), usersController.revokeAdminRole);
router.delete('/:userId', verifyToken, restrictTo('ADMIN'), usersController.deleteUser);

// Authenticated user routes
router.get('/me', verifyToken, usersController.getMe);
router.get('/me/tickets', verifyToken, usersController.getMyTickets);
router.patch('/me', verifyToken, validate(usersSchema.updateProfileSchema), usersController.updateProfile);
router.patch('/me/avatar', verifyToken, uploadSingleImage('image'), usersController.updateAvatar);
router.patch('/me/updatePassword', verifyToken, validate(usersSchema.updatePasswordSchema), usersController.updatePassword);

module.exports = router;
