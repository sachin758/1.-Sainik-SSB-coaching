const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const courseController = require('../controllers/courseController');

const router = express.Router();

// Public — anyone visiting the website can see active courses.
router.get('/', asyncHandler(courseController.listCourses));

// Admin-only writes.
router.post('/', requireAuth, requireRole('admin'), asyncHandler(courseController.createCourse));
router.patch('/:id', requireAuth, requireRole('admin'), asyncHandler(courseController.updateCourse));
router.delete('/:id', requireAuth, requireRole('admin'), asyncHandler(courseController.deleteCourse));

module.exports = router;
