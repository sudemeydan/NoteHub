const bcrypt = require('bcryptjs');
const db = require('../models');

// GET /admin/login - Giriş sayfasını gösterir
exports.getLoginPage = (req, res) => {
    res.render('admin/login');
};

// POST /admin/login - Giriş işlemini gerçekleştirir
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
            req.session.user = { id: user.id, username: user.username };
            return req.session.save(err => {
                if (err) {
                    console.log(err);
                }
                req.flash('success_msg', 'Başarıyla giriş yaptınız.');
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

// GET /admin/logout - Çıkış işlemini gerçekleştirir
exports.postLogout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log(err);
        }
        res.redirect('/admin/login');
    });
};

// --- DÜZELTİLMİŞ FONKSİYON ---
// GET /admin/dashboard - Dashboard sayfasını gösterir ve dersleri listeler
exports.getDashboardPage = async (req, res) => {
    try {
        // Veritabanından tüm dersleri, en yeniden eskiye doğru sıralayarak çek
        const courses = await db.Course.findAll({ order: [['createdAt', 'DESC']] });
        
        // Çekilen dersleri 'courses' değişkeni ile view'e gönder
        res.render('admin/dashboard', {
            title: 'Yönetici Paneli',
            courses: courses 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Sayfa yüklenirken bir hata oluştu.');
    }
};