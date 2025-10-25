const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
// Giriş kontrolü middleware'ini import ediyoruz
const { ensureUserLoggedIn } = require('../middlewares/authMiddleware'); 

// Ana sayfa rotası (Herkes erişebilir)
router.get('/', pageController.getHomePage);

// Ders detay sayfası rotası (Giriş yapmış kullanıcılar erişebilir)
router.get('/dersler/:id', ensureUserLoggedIn, pageController.getCoursePage);

// Not detay sayfası rotası (Giriş yapmış kullanıcılar erişebilir)
router.get('/notlar/:id', ensureUserLoggedIn, pageController.getNotePage);

// "Notlarım" sayfası rotası (Giriş yapmış kullanıcılar erişebilir)
router.get('/notlarim', ensureUserLoggedIn, pageController.getMyNotesPage); 

module.exports = router;