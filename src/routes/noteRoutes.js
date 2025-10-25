const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const { isAuth } = require('../middlewares/authMiddleware');

// --- YENİ EKLENEN VE HATAYI GİDEREN ROTA ---
// POST /admin/notes/create -> Yeni not oluşturma işlemini yapar
router.post('/notes/create', isAuth, noteController.createNote);
// ------------------------------------------

// POST /admin/notes/delete -> Not silme işlemini yapar
router.post('/notes/delete', isAuth, noteController.deleteNote);

// GET /admin/notes/edit/:id -> Düzenleme sayfasını gösterir
router.get('/notes/edit/:id', isAuth, noteController.getEditNotePage);

// POST /admin/notes/update -> Düzenleme işlemini kaydeder
router.post('/notes/update', isAuth, noteController.updateNote);

module.exports = router;