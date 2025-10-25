const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');

// Ana sayfa rotası
router.get('/', pageController.getHomePage);

// Ders detay sayfası rotası
router.get('/dersler/:id', pageController.getCoursePage);

// --- YENİ EKLENEN ROTA ---
// Not detay sayfası rotası
router.get('/notlar/:id', pageController.getNotePage);

module.exports = router;