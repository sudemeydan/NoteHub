const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuth } = require('../middlewares/authMiddleware');

// --- YENİ EKLENEN ROTA ---
// GET /admin -> Kullanıcının durumuna göre yönlendirme yapar
router.get('/', (req, res) => {
    if (req.session.isLoggedIn) {
        res.redirect('/admin/dashboard'); // Giriş yapmışsa panele
    } else {
        res.redirect('/admin/login'); // Giriş yapmamışsa login'e
    }
});
// -------------------------

// GET /admin/login -> Giriş sayfasını gösterir
router.get('/login', authController.getLoginPage);

// POST /admin/login -> Giriş formunu işler
router.post('/login', authController.postLogin);

// GET /admin/logout -> Çıkış işlemini yapar
router.get('/logout', authController.postLogout);

// GET /admin/dashboard -> Yönetici panelini gösterir (isAuth ile korunuyor)
router.get('/dashboard', isAuth, authController.getDashboardPage);

module.exports = router;