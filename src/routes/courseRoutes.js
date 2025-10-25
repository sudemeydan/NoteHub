const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { isAuth } = require('../middlewares/authMiddleware');

// POST /admin/courses/create -> Yeni ders oluşturma işlemini yapar
// Bu rota 'isAuth' middleware'i ile korunmaktadır.
router.post('/courses/create', isAuth, courseController.createCourse);

router.get('/courses/:id', isAuth, courseController.getCourseDetailPage);

module.exports = router;
// ... dosyanın başı, create ve get/:id rotaları aynı kalıyor ...

// GET /admin/courses/:id -> Ders detay sayfasını gösterir
router.get('/courses/:id', isAuth, courseController.getCourseDetailPage);

// --- YENİ ROTA ---
// POST /admin/courses/delete -> Ders silme işlemini yapar
router.post('/courses/delete', isAuth, courseController.deleteCourse);

module.exports = router;