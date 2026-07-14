const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const userController = require('../controllers/userController');

const router = express.Router();

// Every route below requires a valid token AND the admin role.
router.use(requireAuth, requireRole('admin'));

router.post('/', asyncHandler(userController.createStaffUser));
router.get('/', asyncHandler(userController.listUsers));
router.patch('/:id/status', asyncHandler(userController.updateUserStatus));

module.exports = router;
