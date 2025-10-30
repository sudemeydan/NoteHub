const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
// Gerekli middleware'leri import et
const { ensureUserLoggedIn } = require('../middlewares/authMiddleware'); 
const { uploadSubmissionFile } = require('../middlewares/fileUploadMiddleware'); // <-- YENİ

// --- GET ROTALARI (Sayfa Görüntüleme) ---

// Ana sayfa rotası
router.get('/', pageController.getHomePage);

// Ders detay sayfası rotası
router.get('/dersler/:id', ensureUserLoggedIn, pageController.getCoursePage);

// Not detay sayfası rotası
router.get('/notlar/:id', ensureUserLoggedIn, pageController.getNotePage);

// "Notlarım" sayfası rotası
router.get('/notlarim', ensureUserLoggedIn, pageController.getMyNotesPage); 

// Ödev listesi rotası
router.get('/odevlerim', ensureUserLoggedIn, pageController.getAssignmentsListPage);

// Tek ödev detay rotası
router.get('/odevler/:id', ensureUserLoggedIn, pageController.getSingleAssignmentPage);

// --- POST ROTALARI (Form İşlemleri) ---

// YENİ: Ödev teslim etme rotası
// 1. Giriş yapmış mı diye kontrol et (ensureUserLoggedIn)
// 2. Dosya yüklüyorsa işle (uploadSubmissionFile)
// 3. Veritabanına kaydet (pageController.postSubmission)
router.post('/odev-teslim', ensureUserLoggedIn, uploadSubmissionFile, pageController.postSubmission);

module.exports = router;