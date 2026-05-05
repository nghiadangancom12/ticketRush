const express = require('express');
const router = express.Router();
const usersController = require('./usersController');
const { verifyToken, restrictTo } = require('../../middlewares/authMiddleware');
const usersSchema = require('./usersSchema');
const validate = require('../../utils/validate');
const { uploadSingleImage } = require('../../middlewares/uploadImageMiddleware');

// Admin-only routes for managing user roles
router.get('/', verifyToken, restrictTo('ADMIN'), validate(usersSchema.getAllUserSchema), usersController.getAllUsers);
router.patch('/:userId/grant-admin', verifyToken, restrictTo('ADMIN'), usersController.grantAdminRole);
router.patch('/:userId/revoke-admin', verifyToken, restrictTo('ADMIN'), usersController.revokeAdminRole);
router.delete('/:userId', verifyToken, restrictTo('ADMIN'), usersController.deleteUser);

// Authenticated user routes
router.get('/me', verifyToken, usersController.getMe);
router.patch('/me', verifyToken, validate(usersSchema.updateProfileSchema), usersController.updateProfile);

// PATCH /me/avatar — Upload avatar (multipart/form-data, field name: "image")
router.patch(
  '/me/avatar',
  verifyToken,
  uploadSingleImage('image'),  // Multer: đọc + validate file, lưu buffer vào RAM
  usersController.updateAvatar // Controller: Sharp resize/compress → lưu ổ cứng → update DB
);

module.exports = router;


