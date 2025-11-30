const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { isAuth } = require('../middlewares/authMiddleware');

router.post('/courses/create', isAuth, courseController.createCourse);
router.get('/courses/:id', isAuth, courseController.getCourseDetailPage);
router.post('/courses/delete', isAuth, courseController.deleteCourse);
router.get('/courses/edit/:id', isAuth, courseController.getEditCoursePage);
router.post('/courses/update', isAuth, courseController.updateCourse);

module.exports = router;