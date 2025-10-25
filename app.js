const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');
const flash = require('connect-flash');

// Veritabanı ve modelleri import et
const db = require('./src/models');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Session ve Flash Middleware ayarları
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}));
app.use(flash());

// Global değişkenler (tüm view'lara gönderilir)
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
});

// --- ROTA TANIMLAMALARI ---
const viewRoutes = require('./src/routes/viewRoutes.js');
const authRoutes = require('./src/routes/authRoutes');
const courseRoutes = require('./src/routes/courseRoutes');
const noteRoutes = require('./src/routes/noteRoutes');

// Rotaların Uygulamaya Tanıtılması
app.use('/', viewRoutes);
app.use('/admin', authRoutes);
app.use('/admin', courseRoutes);
app.use('/admin', noteRoutes);
// ------------------------------------------

// Veritabanı bağlantısını test et ve sunucuyu başlat
async function startServer() {
    try {
        await db.sequelize.authenticate();
        console.log('Veritabanı bağlantısı başarıyla kuruldu.');

        await db.sequelize.sync({ force: false });
        console.log('Tablolar başarıyla senkronize edildi.');

        app.listen(PORT, () => {
            console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
        });
    } catch (error) {
        console.error('Veritabanına bağlanılamadı:', error);
    }
}

startServer();