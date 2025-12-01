const express = require('express');
const router = express.Router();
const userAuthController = require('../controllers/userAuthController');
const { ensureUserLoggedIn, guestMiddleware } = require('../middlewares/authMiddleware');

// Kayıt ve Giriş
router.get('/kayit', guestMiddleware, userAuthController.getSignupPage);
router.post('/kayit', guestMiddleware, userAuthController.postSignup);
router.get('/giris', guestMiddleware, userAuthController.getLoginPage);
router.post('/giris', guestMiddleware, userAuthController.postLogin);
router.get('/cikis', ensureUserLoggedIn, userAuthController.getLogout);

// Şifre Sıfırlama
router.get('/sifremi-unuttum', guestMiddleware, userAuthController.getForgotPasswordPage);
router.post('/sifremi-unuttum', guestMiddleware, userAuthController.postForgotPassword);
router.get('/sifre-sifirla/:token', guestMiddleware, userAuthController.getResetPasswordPage);
router.post('/sifre-sifirla/:token', guestMiddleware, userAuthController.postResetPassword);

// --- YENİ EKLENEN: E-Posta Doğrulama Rotası ---
router.get('/email-dogrula/:token', guestMiddleware, userAuthController.verifyEmail);
// ----------------------------------------------

module.exports = router;