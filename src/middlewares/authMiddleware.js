// Admin kontrolü
const isAuth = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return next();
    }
    req.flash('error_msg', 'Bu sayfayı görüntülemek için admin olarak giriş yapmalısınız.');
    res.redirect('/admin/login');
};

// Normal kullanıcı kontrolü
const ensureUserLoggedIn = (req, res, next) => {
    // Kullanıcı veya Admin giriş yapmışsa izin ver
    if (req.session.isUserLoggedIn || req.session.isLoggedIn) {
        return next();
    }
    req.flash('error_msg', 'Bu sayfayı görüntülemek için giriş yapmalısınız.');
    res.redirect('/giris');
};

// Admin yetki kontrolü
const isAdmin = (req, res, next) => {
    if (req.session.isLoggedIn && req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    req.flash('error_msg', 'Bu işlem için yetkiniz yok.');
    const backURL = req.header('Referer') || '/';
    res.redirect(backURL);
};

// Misafir kontrolü (Giriş yapmışsa login/register'a giremesin)
const guestMiddleware = (req, res, next) => {
    if (req.session.isUserLoggedIn || req.session.isLoggedIn) {
        return res.redirect('/');
    }
    next();
};

// BU KISIM ÇOK ÖNEMLİ: Hepsi tek bir paket olarak dışa aktarılıyor
module.exports = {
    isAuth,
    ensureUserLoggedIn,
    isAdmin,
    guestMiddleware
};