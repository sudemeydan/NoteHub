/**
 * Kullanıcının oturum açıp açmadığını kontrol eden middleware.
 * Eğer kullanıcı giriş yapmışsa, isteğin devam etmesine izin verir.
 * Aksi takdirde, kullanıcıyı giriş sayfasına yönlendirir.
 */
exports.isAuth = (req, res, next) => {
    if (req.session.isLoggedIn) {
        // Kullanıcı giriş yapmış, bir sonraki adıma geç
        return next();
    }
    // Kullanıcı giriş yapmamış, login sayfasına yönlendir
    req.flash('error_msg', 'Bu sayfayı görüntülemek için giriş yapmalısınız.');
    res.redirect('/admin/login');
};