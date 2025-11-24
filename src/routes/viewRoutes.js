const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const { ensureUserLoggedIn } = require('../middlewares/authMiddleware'); 
const { uploadSubmissionFile } = require('../middlewares/fileUploadMiddleware');

// --- GET ROTALARI ---
router.get('/', pageController.getHomePage);
router.get('/dersler/:id', ensureUserLoggedIn, pageController.getCoursePage);
router.get('/notlar/:id', ensureUserLoggedIn, pageController.getNotePage);
router.get('/notlarim', ensureUserLoggedIn, pageController.getMyNotesPage); 
router.get('/odevlerim', ensureUserLoggedIn, pageController.getAssignmentsListPage);
router.get('/odevler/:id', ensureUserLoggedIn, pageController.getSingleAssignmentPage);
router.get('/arama', ensureUserLoggedIn, pageController.search);

// --- RANDEVU ROTALARI (Öğrenci) ---
router.get('/randevu-al', ensureUserLoggedIn, pageController.getCalendarPage);

// YENİ: Öğrencinin randevularını listeleme rotası
router.get('/randevularim', ensureUserLoggedIn, pageController.getStudentAppointmentsPage);

// --- POST ROTALARI ---
router.post('/odev-teslim', ensureUserLoggedIn, uploadSubmissionFile, pageController.postSubmission);
router.post('/randevu-talep', ensureUserLoggedIn, pageController.createAppointmentRequest);

module.exports = router;