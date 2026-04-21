const express = require('express');
const router = express.Router();
const authController = require('./authController');
const authSchema = require('./authSchema'); 
const validate = require('../../utils/validate');

// --- PUBLIC ROUTES ---

router.post(
  '/register', 
  validate(authSchema.registerSchema), 
  authController.register
);

router.post(
  '/login', 
  validate(authSchema.loginSchema), 
  authController.login
);

router.post(
  '/forgotPassword',
  validate(authSchema.forgotPasswordSchema),
  authController.forgotPassword
);

// Đổi sang PATCH nếu bạn muốn chuẩn RESTful hơn
router.patch(
  '/resetPassword/:token',
  validate(authSchema.resetPasswordSchema),
  authController.resetPassword
);

// Route đăng xuất
router.get('/logout', authController.logout);

module.exports = router;