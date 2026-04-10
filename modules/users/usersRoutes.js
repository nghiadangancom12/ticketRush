const express = require('express');
const router = express.Router();
const usersController = require('./usersController');
const { verifyToken, isAdmin } = require('../auth/auth.middleware');

// Admin-only routes for managing user roles
router.patch('/:userId/grant-admin', verifyToken, isAdmin, usersController.grantAdminRole);
router.patch('/:userId/revoke-admin', verifyToken, isAdmin, usersController.revokeAdminRole);
router.get('/me', verifyToken, usersController.getMe);
router.patch('me', verifyToken, usersController.getMe)
module.exports = router;
