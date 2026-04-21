const express = require('express');
const router = express.Router();
const usersController = require('./usersController');
const { verifyToken, isAdmin } = require('../auth/auth.middleware');
const usersSchema = require('./usersSchema'); 
const validate = require('../../utils/validate');
// Admin-only routes for managing user roles
router.patch('/:userId/grant-admin', verifyToken, isAdmin, usersController.grantAdminRole);
router.patch('/:userId/revoke-admin', verifyToken, isAdmin, usersController.revokeAdminRole);
router.get('/me', verifyToken, usersController.getMe);
router.patch('/me', verifyToken, validate(usersSchema.updateProfileSchema), usersController.updateProfile)
module.exports = router;
