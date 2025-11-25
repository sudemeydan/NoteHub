const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const { ensureUserLoggedIn } = require('../middlewares/authMiddleware'); 
const { uploadSubmissionFile } = require('../middlewares/fileUploadMiddleware');

// --- GET ROTALARI ---
router.get('/', pageController.getHomePage);

// Ders detay sayfası (ARTIK HERKESE AÇIK - İçeride filtreleme yapılacak)
router.get('/dersler/:id', pageController.getCoursePage); 

// Not detay sayfası (ARTIK HERKESE AÇIK - İçeride kontrol yapılacak)
router.get('/notlar/:id', pageController.getNotePage);

router.get('/notlarim', ensureUserLoggedIn, pageController.getMyNotesPage); 
router.get('/odevlerim', ensureUserLoggedIn, pageController.getAssignmentsListPage);
router.get('/odevler/:id', ensureUserLoggedIn, pageController.getSingleAssignmentPage);
router.get('/arama', ensureUserLoggedIn, pageController.search);
router.get('/randevu-al', ensureUserLoggedIn, pageController.getCalendarPage);

// --- EKSİK OLAN ROTA BURAYA EKLENDİ ---
router.get('/randevularim', ensureUserLoggedIn, pageController.getStudentAppointmentsPage);
// --------------------------------------

// --- POST ROTALARI ---
router.post('/odev-teslim', ensureUserLoggedIn, uploadSubmissionFile, pageController.postSubmission);
router.post('/randevu-talep', ensureUserLoggedIn, pageController.createAppointmentRequest);

module.exports = router;