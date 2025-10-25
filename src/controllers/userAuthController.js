const bcrypt = require('bcryptjs');
const db = require('../models');

// GET /kayit - Kayıt sayfasını gösterir
exports.getSignupPage = (req, res) => {
    // Render the signup page view
    res.render('pages/signup', { 
        title: 'Kayıt Ol',
        // Pass any other necessary variables for the view if needed
    });
};

// POST /kayit - Yeni kullanıcıyı kaydeder
exports.postSignup = async (req, res) => {
    const { username, password, confirmPassword } = req.body;

    // --- Input Validation ---
    let errors = [];
    if (!username || !password || !confirmPassword) {
        errors.push({ msg: 'Lütfen tüm alanları doldurun.' });
    }
    if (password !== confirmPassword) {
        errors.push({ msg: 'Şifreler eşleşmiyor.' });
    }
    if (password && password.length < 6) { // Example: Minimum password length
        errors.push({ msg: 'Şifre en az 6 karakter olmalıdır.' });
    }

    // If there are validation errors, redirect back to signup with errors
    if (errors.length > 0) {
        // You might want to pass the entered username back to the form
        // for better UX, but flash messages are simpler for now.
        errors.forEach(err => req.flash('error_msg', err.msg));
        return res.redirect('/kayit');
    }

    try {
        // Check if username already exists (case-insensitive check might be better depending on DB)
        const existingUser = await db.User.findOne({ where: { username: username } });
        if (existingUser) {
            req.flash('error_msg', 'Bu kullanıcı adı zaten alınmış.');
            return res.redirect('/kayit');
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 12); // 12 salt rounds

        // Create the new user in the database (role defaults to 'user' via the model)
        await db.User.create({
            username: username,
            password: hashedPassword
            // 'role' will automatically be 'user' due to the model's defaultValue
        });

        // Flash success message and redirect to the login page
        req.flash('success_msg', 'Başarıyla kayıt oldunuz! Şimdi giriş yapabilirsiniz.');
        res.redirect('/giris');

    } catch (error) {
        console.error("Signup Error:", error); // Log the detailed error
        req.flash('error_msg', 'Kayıt sırasında beklenmedik bir hata oluştu. Lütfen tekrar deneyin.');
        res.redirect('/kayit');
    }
};

// GET /giris - Giriş sayfasını gösterir
exports.getLoginPage = (req, res) => {
    // Render the login page view
    res.render('pages/login', { 
        title: 'Giriş Yap',
        // Pass any other necessary variables for the view if needed
    });
};

// POST /giris - Kullanıcı girişini doğrular
exports.postLogin = async (req, res) => {
    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
        req.flash('error_msg', 'Lütfen kullanıcı adı ve şifre girin.');
        return res.redirect('/giris');
    }

    try {
        // Find the user by username
        const user = await db.User.findOne({ where: { username: username } });

        // Check if user exists AND is NOT an admin (admins use /admin/login)
        if (!user || user.role === 'admin') {
            req.flash('error_msg', 'Kullanıcı adı veya şifre hatalı.');
            return res.redirect('/giris');
        }

        // Compare the submitted password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            // Passwords match - Create session for the regular user
            req.session.isUserLoggedIn = true; // Use a different flag than admin's isLoggedIn
            req.session.user = { 
                id: user.id, 
                username: user.username, 
                role: user.role 
            };
            
            // Save the session and redirect to the "My Notes" page
            return req.session.save(err => {
                if (err) {
                    console.error("Session Save Error:", err);
                    req.flash('error_msg', 'Oturum kaydedilirken bir hata oluştu.');
                    return res.redirect('/giris');
                }
                // Redirect to '/notlarim' upon successful login
                res.redirect('/notlarim'); 
            });
        } else {
            // Passwords do not match
            req.flash('error_msg', 'Kullanıcı adı veya şifre hatalı.');
            return res.redirect('/giris');
        }
    } catch (error) {
        console.error("Login Error:", error); // Log the detailed error
        req.flash('error_msg', 'Giriş sırasında beklenmedik bir hata oluştu. Lütfen tekrar deneyin.');
        res.redirect('/giris');
    }
};

// GET /cikis - Kullanıcı çıkışını yapar (Logs out both regular users and admins if they use this route)
exports.getLogout = (req, res) => {
    // Destroy the session
    req.session.destroy(err => {
        if (err) {
            console.error("Logout Error:", err);
            // Optionally flash an error message if logout fails, but usually just redirect
        }
        // Redirect to the homepage after logout
        res.redirect('/'); 
    });
};