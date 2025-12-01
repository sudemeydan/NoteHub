const bcrypt = require('bcryptjs');
const db = require('../models');
const { Op } = require('sequelize');
const crypto = require('crypto'); 
const nodemailer = require('nodemailer'); 

// GET /kayit
exports.getSignupPage = (req, res) => {
    res.render('pages/signup', { title: 'Kayıt Ol' });
};

// POST /kayit - GÜNCELLENDİ: E-posta Doğrulama Eklendi
exports.postSignup = async (req, res) => {
    const { username, email, phoneNumber, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
        req.flash('error_msg', 'Lütfen zorunlu alanları doldurun.');
        return res.redirect('/kayit');
    }
    if (password !== confirmPassword) {
        req.flash('error_msg', 'Şifreler eşleşmiyor.');
        return res.redirect('/kayit');
    }

    try {
        const existingUser = await db.User.findOne({
            where: { [Op.or]: [{ username: username }, { email: email }] }
        });

        if (existingUser) {
            req.flash('error_msg', 'Bu kullanıcı adı veya e-posta zaten kullanılıyor.');
            return res.redirect('/kayit');
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        
        // Rastgele doğrulama tokenı üret
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Kullanıcıyı oluştur (isVerified: false olarak)
        await db.User.create({
            username,
            email,
            phoneNumber,
            password: hashedPassword,
            isVerified: false, // Henüz doğrulanmadı
            emailVerificationToken: verificationToken
        });

        // --- DOĞRULAMA MAİLİ GÖNDER ---
        if (process.env.EMAIL_USER) {
            const transporter = nodemailer.createTransport({
                service: process.env.EMAIL_SERVICE,
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
            });

            const verifyUrl = `http://${req.headers.host}/email-dogrula/${verificationToken}`;

            const mailOptions = {
                from: `"NoteHub Güvenlik" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Lütfen E-Posta Adresinizi Doğrulayın',
                html: `
                    <h3>Aramıza Hoş Geldiniz, ${username}!</h3>
                    <p>Kaydınızı tamamlamak ve sisteme giriş yapabilmek için lütfen aşağıdaki linke tıklayarak e-posta adresinizi doğrulayın:</p>
                    <p><a href="${verifyUrl}" style="background-color: #0d6efd; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">E-Postamı Doğrula</a></p>
                    <p>veya linki tarayıcınıza yapıştırın: <br> ${verifyUrl}</p>
                `
            };

            await transporter.sendMail(mailOptions);
        }
        // -----------------------------

        req.flash('success_msg', 'Kayıt başarılı! Lütfen giriş yapmadan önce e-posta adresinize gönderilen doğrulama linkine tıklayın.');
        res.redirect('/giris');

    } catch (error) {
        console.error("Signup Error:", error);
        req.flash('error_msg', 'Kayıt sırasında bir hata oluştu.');
        res.redirect('/kayit');
    }
};

// YENİ: E-Posta Doğrulama İşlemi
exports.verifyEmail = async (req, res) => {
    const token = req.params.token;

    try {
        const user = await db.User.findOne({ where: { emailVerificationToken: token } });

        if (!user) {
            req.flash('error_msg', 'Geçersiz veya süresi dolmuş doğrulama linki.');
            return res.redirect('/giris');
        }

        // Kullanıcıyı doğrula ve tokenı temizle
        user.isVerified = true;
        user.emailVerificationToken = null;
        await user.save();

        req.flash('success_msg', 'E-posta adresiniz başarıyla doğrulandı. Artık giriş yapabilirsiniz.');
        res.redirect('/giris');

    } catch (error) {
        console.error("Verification Error:", error);
        req.flash('error_msg', 'Doğrulama sırasında bir hata oluştu.');
        res.redirect('/giris');
    }
};

// GET /giris
exports.getLoginPage = (req, res) => {
    res.render('pages/login', { title: 'Giriş Yap' });
};

// POST /giris - GÜNCELLENDİ: Doğrulama Kontrolü Eklendi
exports.postLogin = async (req, res) => {
    const { loginInput, password } = req.body;

    if (!loginInput || !password) {
        req.flash('error_msg', 'Lütfen bilgileri girin.');
        return res.redirect('/giris');
    }

    try {
        const user = await db.User.findOne({
            where: { [Op.or]: [{ username: loginInput }, { email: loginInput }] }
        });

        if (!user || user.role === 'admin') {
            req.flash('error_msg', 'Kullanıcı bulunamadı veya şifre hatalı.');
            return res.redirect('/giris');
        }

        // --- DOĞRULAMA KONTROLÜ ---
        if (!user.isVerified) {
            req.flash('error_msg', 'Giriş yapabilmek için lütfen e-posta adresinizi doğrulayın. Mail kutunuzu (ve spam klasörünü) kontrol edin.');
            return res.redirect('/giris');
        }
        // -------------------------

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

// ... Şifremi Unuttum Fonksiyonları (AYNEN KALSIN) ...
exports.getForgotPasswordPage = (req, res) => {
    res.render('pages/forgot-password', { title: 'Şifremi Unuttum' });
};

exports.postForgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await db.User.findOne({ where: { email } });
        if (!user) {
            req.flash('error_msg', 'Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı.');
            return res.redirect('/sifremi-unuttum');
        }
        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();

        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });
        const mailOptions = {
            from: `"NoteHub Destek" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'NoteHub Şifre Sıfırlama Talebi',
            html: `
                <p>Merhaba ${user.username},</p>
                <p>Hesabınız için şifre sıfırlama talebinde bulundunuz.</p>
                <a href="http://${req.headers.host}/sifre-sifirla/${token}">Şifremi Sıfırla</a>
            `
        };
        await transporter.sendMail(mailOptions);
        req.flash('success_msg', 'Şifre sıfırlama linki e-posta adresinize gönderildi.');
        res.redirect('/giris');
    } catch (error) {
        console.error("Forgot Password Error:", error);
        req.flash('error_msg', 'Hata oluştu.');
        res.redirect('/sifremi-unuttum');
    }
};

exports.getResetPasswordPage = async (req, res) => {
    try {
        const user = await db.User.findOne({
            where: {
                resetPasswordToken: req.params.token,
                resetPasswordExpires: { [Op.gt]: Date.now() }
            }
        });
        if (!user) {
            req.flash('error_msg', 'Link geçersiz veya süresi dolmuş.');
            return res.redirect('/sifremi-unuttum');
        }
        res.render('pages/reset-password', { title: 'Yeni Şifre Belirle', token: req.params.token });
    } catch (error) { res.redirect('/sifremi-unuttum'); }
};

exports.postResetPassword = async (req, res) => {
    const { password, confirmPassword } = req.body;
    const token = req.params.token;
    try {
        const user = await db.User.findOne({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: { [Op.gt]: Date.now() }
            }
        });
        if (!user) {
            req.flash('error_msg', 'Link geçersiz.');
            return res.redirect('/sifremi-unuttum');
        }
        if (password !== confirmPassword) {
            req.flash('error_msg', 'Şifreler eşleşmiyor.');
            return res.redirect(`/sifre-sifirla/${token}`);
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();
        req.flash('success_msg', 'Şifre güncellendi. Giriş yapabilirsiniz.');
        res.redirect('/giris');
    } catch (error) {
        req.flash('error_msg', 'Hata oluştu.');
        res.redirect('/giris');
    }
};