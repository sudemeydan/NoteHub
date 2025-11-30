const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
// Middleware importunu garantiye alıyoruz
const { ensureUserLoggedIn } = require('../middlewares/authMiddleware'); 
const { uploadSubmissionFile } = require('../middlewares/fileUploadMiddleware');

// --- GET ROTALARI ---
router.get('/', pageController.getHomePage);
router.get('/dersler/:id', pageController.getCoursePage); 
router.get('/notlar/:id', pageController.getNotePage);

// Giriş Gerektirenler
router.get('/notlarim', ensureUserLoggedIn, pageController.getMyNotesPage); 
router.get('/odevlerim', ensureUserLoggedIn, pageController.getAssignmentsListPage);
router.get('/odevler/:id', ensureUserLoggedIn, pageController.getSingleAssignmentPage);
router.get('/arama', ensureUserLoggedIn, pageController.search);
router.get('/randevu-al', ensureUserLoggedIn, pageController.getCalendarPage);
router.get('/randevularim', ensureUserLoggedIn, pageController.getStudentAppointmentsPage);

// --- POST ROTALARI ---
router.post('/odev-teslim', ensureUserLoggedIn, uploadSubmissionFile, pageController.postSubmission);
router.post('/randevu-talep', ensureUserLoggedIn, pageController.createAppointmentRequest);

module.exports = router;