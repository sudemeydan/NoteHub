const bcrypt = require('bcryptjs');
const db = require('../models');

// GET /admin/login - Giriş sayfası
exports.getLoginPage = (req, res) => {
    if (req.session.isLoggedIn) {
        return res.redirect('/admin/dashboard');
    }
    res.render('admin/login', { 
        title: 'Admin Girişi' 
    });
};

// POST /admin/login - Giriş işlemi
exports.postLogin = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await db.User.findOne({ where: { username: username } });

        if (!user) {
            req.flash('error_msg', 'Kullanıcı adı veya şifre hatalı.');
            return res.redirect('/admin/login');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        
        if (isMatch) {
            req.session.isLoggedIn = true;
            req.session.user = { 
                id: user.id, 
                username: user.username, 
                role: user.role 
            };
            
            return req.session.save(err => {
                if (err) console.log(err);
                req.flash('success_msg', 'Admin olarak başarıyla giriş yaptınız.');
                res.redirect('/admin/dashboard');
            });
        } else {
            req.flash('error_msg', 'Kullanıcı adı veya şifre hatalı.');
            return res.redirect('/admin/login');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Sunucu hatası.');
    }
};

// GET /admin/logout - Çıkış
exports.postLogout = (req, res) => {
    req.session.destroy(err => {
        if (err) console.log(err);
        res.redirect('/');
    });
};

// GET /admin/dashboard - Panel
exports.getDashboardPage = async (req, res) => {
    try {
        // HATA BURADAYDI: Eski kodda burada 'db.Category.findAll()' vardı.
        // Artık sadece Dersleri çekiyoruz.
        const courses = await db.Course.findAll({ order: [['createdAt', 'DESC']] });
        
        res.render('admin/dashboard', {
            title: 'Yönetici Paneli',
            courses: courses
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Sayfa yüklenirken bir hata oluştu.');
    }
};