const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { isAuth } = require('../middlewares/authMiddleware');

// POST /admin/courses/create -> Yeni ders oluşturma
router.post('/courses/create', isAuth, courseController.createCourse);

// GET /admin/courses/:id -> Ders detay sayfasını gösterir
router.get('/courses/:id', isAuth, courseController.getCourseDetailPage);

// POST /admin/courses/delete -> Ders silme
router.post('/courses/delete', isAuth, courseController.deleteCourse);

// --- YENİ ROTALAR (DÜZENLEME) ---
router.get('/courses/edit/:id', isAuth, courseController.getEditCoursePage);
router.post('/courses/update', isAuth, courseController.updateCourse);

module.exports = router;