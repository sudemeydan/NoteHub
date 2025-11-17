// Admin sayfaları için middleware (Giriş yapmış mı?)
exports.isAuth = (req, res, next) => {
    // Sadece admin oturumunu (isLoggedIn) kontrol eder
    if (req.session.isLoggedIn) {
        return next();
    }
    req.flash('error_msg', 'Bu sayfayı görüntülemek için admin olarak giriş yapmalısınız.');
    res.redirect('/admin/login');
};

// Normal kullanıcı sayfaları için middleware (Giriş yapmış mı?)
exports.ensureUserLoggedIn = (req, res, next) => {
    // Hem normal kullanıcı (isUserLoggedIn) hem de admin (isLoggedIn) oturumunu kontrol eder
    // Böylece adminler de kullanıcı sayfalarını görebilir
    if (req.session.isUserLoggedIn || req.session.isLoggedIn) {
        return next(); // Giriş yapmışsa devam et
    }
    // Giriş yapmamışsa
    req.flash('error_msg', 'Bu sayfayı görüntülemek için giriş yapmalısınız.');
    res.redirect('/giris'); // Normal kullanıcı giriş sayfasına yönlendir
};

// Sadece Admin İzin Middleware'i (Rol kontrolü)
exports.isAdmin = (req, res, next) => {
    // Admin olarak giriş yapmış mı ve rolü 'admin' mi diye bakar
    if (req.session.isLoggedIn && req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    req.flash('error_msg', 'Bu işlem için yetkiniz yok.');
    // Kullanıcıyı ya geldiği yere ya da ana sayfaya yönlendir
    const backURL = req.header('Referer') || '/';
    res.redirect(backURL);
};

// Sadece Misafir İzin Middleware'i (Giriş yapmamışları kontrol eder)
exports.guestMiddleware = (req, res, next) => {
    // Hem normal kullanıcı hem de admin oturumu kontrol edilir
    if (req.session.isUserLoggedIn || req.session.isLoggedIn) {
        return res.redirect('/'); // Giriş yapmışsa ana sayfaya yönlendir
    }
    next(); // Giriş yapmamışsa devam et
};