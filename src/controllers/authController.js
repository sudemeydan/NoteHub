const bcrypt = require('bcryptjs');
const db = require('../models');

// GET /admin/login - Admin giriş sayfasını gösterir
exports.getLoginPage = (req, res) => {
    // Admin giriş sayfasını render et
    // Eğer daha önce admin/login.ejs oluşturmadıysak, oluşturmalıyız.
    // Varsayılan olarak 'admin/login' olduğunu varsayıyorum.
    if (req.session.isLoggedIn) {
        return res.redirect('/admin/dashboard'); // Zaten giriş yapmışsa panele yönlendir
    }
    res.render('admin/login', { 
        title: 'Admin Girişi' 
        // Not: 'admin/login.ejs' dosyanızın olduğundan emin olun.
        // Eğer 'pages/login.ejs'yi kullanıyorsanız, burası 'pages/login' olmalı.
        // Ama admin için ayrı bir login sayfası olması en iyisidir.
    });
};

// POST /admin/login - Admin giriş işlemini gerçekleştirir
exports.postLogin = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await db.User.findOne({ where: { username: username } });

        // 1. Kullanıcı bulunamadıysa
        if (!user) {
            req.flash('error_msg', 'Kullanıcı adı veya şifre hatalı.');
            return res.redirect('/admin/login');
        }

        // 2. Parolayı karşılaştır
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (isMatch) {
            // Parola doğruysa, session oluştur
            req.session.isLoggedIn = true; // Admin oturumu
            
            // --- DÜZELTME BURADA ---
            // Oturuma 'role' bilgisini de ekliyoruz!
            req.session.user = { 
                id: user.id, 
                username: user.username, 
                role: user.role // <-- EKLENEN SATIR
            };
            // -----------------------
            
            return req.session.save(err => {
                if (err) {
                    console.log(err);
                }
                req.flash('success_msg', 'Admin olarak başarıyla giriş yaptınız.');
                res.redirect('/admin/dashboard');
            });
        } else {
            // Parola yanlışsa
            req.flash('error_msg', 'Kullanıcı adı veya şifre hatalı.');
            return res.redirect('/admin/login');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Sunucu hatası.');
    }
};

// GET /admin/logout - Admin çıkış işlemini gerçekleştirir
exports.postLogout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log(err);
        }
        res.redirect('/'); // Çıkış yapınca ana sayfaya yönlendir
    });
};

// GET /admin/dashboard - Dashboard sayfasını gösterir
exports.getDashboardPage = async (req, res) => {
    try {
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