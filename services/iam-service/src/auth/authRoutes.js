const express = require('express');
const router = express.Router();
const authController = require('./authController');
const authSchema = require('./authSchema');
const validate = require('../../../shared/utils/validate');

// PUBLIC ROUTES
router.post('/register', validate(authSchema.registerSchema), authController.register);
router.post('/login',    validate(authSchema.loginSchema),    authController.login);
router.post('/forgotPassword', validate(authSchema.forgotPasswordSchema), authController.forgotPassword);
router.patch('/resetPassword/:token', validate(authSchema.resetPasswordSchema), authController.resetPassword);
router.get('/logout', authController.logout);

module.exports = router;
