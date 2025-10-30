const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { uploadAssignmentFile } = require('../middlewares/fileUploadMiddleware');
const { isAuth, isAdmin } = require('../middlewares/authMiddleware');

// Tüm rotalar admin yetkisi gerektirmeli
router.use(isAuth, isAdmin);

// GET /admin/assignments -> Ödev yönetim sayfasını göster
router.get('/assignments', assignmentController.getAssignmentsPage);

// POST /admin/assignments/create -> Yeni ödev oluştur (dosya yükleme dahil)
router.post('/assignments/create', uploadAssignmentFile, assignmentController.createAssignment);

// --- YENİ ROTA: Teslimleri Gösterme ---
// GET /admin/assignments/:id/submissions -> Bir ödeve ait teslimleri listeler
router.get('/assignments/:id/submissions', assignmentController.getAssignmentSubmissionsPage);
// --- ---

module.exports = router;