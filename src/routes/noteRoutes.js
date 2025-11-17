const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const { isAuth } = require('../middlewares/authMiddleware');
// YENİ: TinyMCE için resim yükleme middleware'ini import et
const { uploadTinyMCEImage } = require('../middlewares/fileUploadMiddleware');

// --- YENİ ROTA (TinyMCE Resim Yüklemesi için) ---
router.post('/notes/image-upload', isAuth, uploadTinyMCEImage, noteController.uploadImage);

// POST /admin/notes/create -> Yeni not oluşturma (Formun kendisi)
router.post('/notes/create', isAuth, noteController.createNote);

// POST /admin/notes/delete -> Not silme
router.post('/notes/delete', isAuth, noteController.deleteNote);

// GET /admin/notes/edit/:id -> Düzenleme sayfasını göster
router.get('/notes/edit/:id', isAuth, noteController.getEditNotePage);

// POST /admin/notes/update -> Düzenleme işlemini kaydet
router.post('/notes/update', isAuth, noteController.updateNote);

module.exports = router;