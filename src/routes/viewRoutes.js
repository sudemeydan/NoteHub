const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
// Gerekli middleware'leri import et
const { ensureUserLoggedIn } = require('../middlewares/authMiddleware'); 
const { uploadSubmissionFile } = require('../middlewares/fileUploadMiddleware');

// --- GET ROTALARI (Sayfa Görüntüleme) ---

// Ana sayfa rotası
router.get('/', pageController.getHomePage);

// Ders detay sayfası rotası (Giriş Gerekli)
router.get('/dersler/:id', ensureUserLoggedIn, pageController.getCoursePage);

// Not detay sayfası rotası (Giriş Gerekli) - HATA BURADAYDI
router.get('/notlar/:id', ensureUserLoggedIn, pageController.getNotePage);

// "Notlarım" sayfası rotası
router.get('/notlarim', ensureUserLoggedIn, pageController.getMyNotesPage); 

// Ödev listesi rotası
router.get('/odevlerim', ensureUserLoggedIn, pageController.getAssignmentsListPage);

// Tek ödev detay rotası
router.get('/odevler/:id', ensureUserLoggedIn, pageController.getSingleAssignmentPage);

// --- ARAMA ROTASI ---
router.get('/arama', ensureUserLoggedIn, pageController.search);

// --- POST ROTALARI (Form İşlemleri) ---
router.post('/odev-teslim', ensureUserLoggedIn, uploadSubmissionFile, pageController.postSubmission);

module.exports = router;