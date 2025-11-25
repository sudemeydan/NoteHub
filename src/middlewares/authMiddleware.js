// Admin kontrolü
exports.isAuth = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return next();
    }
    req.flash('error_msg', 'Bu sayfayı görüntülemek için admin olarak giriş yapmalısınız.');
    res.redirect('/admin/login');
};

// --- İŞTE EKSİK OLABİLECEK FONKSİYON ---
// Normal kullanıcı kontrolü
exports.ensureUserLoggedIn = (req, res, next) => {
    if (req.session.isUserLoggedIn || req.session.isLoggedIn) {
        return next();
    }
    req.flash('error_msg', 'Bu sayfayı görüntülemek için giriş yapmalısınız.');
    res.redirect('/giris');
};
// ---------------------------------------

// Admin yetki kontrolü
exports.isAdmin = (req, res, next) => {
    if (req.session.isLoggedIn && req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    req.flash('error_msg', 'Bu işlem için yetkiniz yok.');
    const backURL = req.header('Referer') || '/';
    res.redirect(backURL);
};

// Misafir kontrolü
exports.guestMiddleware = (req, res, next) => {
    if (req.session.isUserLoggedIn || req.session.isLoggedIn) {
        return res.redirect('/');
    }
    next();
};