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

// YENİ: ARAMA API ROTASI
router.get('/arama', ensureUserLoggedIn, pageController.search);

// --- POST ROTALARI ---
router.post('/odev-teslim', ensureUserLoggedIn, uploadSubmissionFile, pageController.postSubmission);

module.exports = router;