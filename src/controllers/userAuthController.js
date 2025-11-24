const bcrypt = require('bcryptjs');
const db = require('../models');
const { Op } = require('sequelize'); // 'veya' sorgusu için gerekli

// GET /kayit
exports.getSignupPage = (req, res) => {
    res.render('pages/signup', { title: 'Kayıt Ol' });
};

// POST /kayit - YENİ: Mail ve Telefon Kaydı
exports.postSignup = async (req, res) => {
    const { username, email, phoneNumber, password, confirmPassword } = req.body;

    // Basit validasyonlar
    if (!username || !email || !password || !confirmPassword) {
        req.flash('error_msg', 'Lütfen zorunlu alanları doldurun.');
        return res.redirect('/kayit');
    }
    if (password !== confirmPassword) {
        req.flash('error_msg', 'Şifreler eşleşmiyor.');
        return res.redirect('/kayit');
    }

    try {
        // Kullanıcı adı veya Email daha önce alınmış mı?
        const existingUser = await db.User.findOne({
            where: {
                [Op.or]: [
                    { username: username },
                    { email: email }
                ]
            }
        });

        if (existingUser) {
            req.flash('error_msg', 'Bu kullanıcı adı veya e-posta zaten kullanılıyor.');
            return res.redirect('/kayit');
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        // Yeni kullanıcıyı oluştur
        await db.User.create({
            username,
            email,
            phoneNumber,
            password: hashedPassword
        });

        req.flash('success_msg', 'Kayıt başarılı! Giriş yapabilirsiniz.');
        res.redirect('/giris');

    } catch (error) {
        console.error("Signup Error:", error);
        req.flash('error_msg', 'Kayıt sırasında bir hata oluştu.');
        res.redirect('/kayit');
    }
};

// GET /giris
exports.getLoginPage = (req, res) => {
    res.render('pages/login', { title: 'Giriş Yap' });
};

// POST /giris - YENİ: Kullanıcı Adı VEYA Email ile Giriş
exports.postLogin = async (req, res) => {
    const { loginInput, password } = req.body; // Formdan 'loginInput' adıyla gelecek

    if (!loginInput || !password) {
        req.flash('error_msg', 'Lütfen bilgileri girin.');
        return res.redirect('/giris');
    }

    try {
        // Kullanıcı adı veya Email ile ara
        const user = await db.User.findOne({
            where: {
                [Op.or]: [
                    { username: loginInput },
                    { email: loginInput }
                ]
            }
        });

        // Kullanıcı yoksa veya Admin ise (Admin girişi ayrıdır)
        if (!user || user.role === 'admin') {
            req.flash('error_msg', 'Kullanıcı bulunamadı veya şifre hatalı.');
            return res.redirect('/giris');
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            req.session.isUserLoggedIn = true;
            req.session.user = { 
                id: user.id, 
                username: user.username, 
                email: user.email, 
                role: user.role 
            };
            
            return req.session.save(() => res.redirect('/notlarim'));
        } else {
            req.flash('error_msg', 'Şifre hatalı.');
            return res.redirect('/giris');
        }
    } catch (error) {
        console.error("Login Error:", error);
        req.flash('error_msg', 'Giriş hatası.');
        res.redirect('/giris');
    }
};

// GET /cikis
exports.getLogout = (req, res) => {
    req.session.destroy(() => res.redirect('/'));
};