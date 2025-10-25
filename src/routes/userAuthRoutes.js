const express = require('express');
const router = express.Router();
const userAuthController = require('../controllers/userAuthController');
// Artık guestMiddleware'i de buradan alıyoruz
const { ensureUserLoggedIn, guestMiddleware } = require('../middlewares/authMiddleware');

// GET /kayit -> Kayıt sayfasını gösterir (Sadece misafirler)
router.get('/kayit', guestMiddleware, userAuthController.getSignupPage);

// POST /kayit -> Kayıt formunu işler (Sadece misafirler)
router.post('/kayit', guestMiddleware, userAuthController.postSignup);

// GET /giris -> Giriş sayfasını gösterir (Sadece misafirler)
router.get('/giris', guestMiddleware, userAuthController.getLoginPage);

// POST /giris -> Giriş formunu işler (Sadece misafirler)
router.post('/giris', guestMiddleware, userAuthController.postLogin);

// GET /cikis -> Çıkış işlemini yapar (Sadece giriş yapmış kullanıcılar)
router.get('/cikis', ensureUserLoggedIn, userAuthController.getLogout);

module.exports = router;