const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');
const flash = require('connect-flash');
const { ensureUserLoggedIn } = require('./src/middlewares/authMiddleware'); 

// Rota Tanımlamaları
const viewRoutes = require('./src/routes/viewRoutes');
const userAuthRoutes = require('./src/routes/userAuthRoutes');
const authRoutes = require('./src/routes/authRoutes'); 
const courseRoutes = require('./src/routes/courseRoutes');
const noteRoutes = require('./src/routes/noteRoutes');
const assignmentRoutes = require('./src/routes/assignmentRoutes');
const forumRoutes = require('./src/routes/forumRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes'); // Randevu rotasını ekledik

// Import database and models
const db = require('./src/models'); // Artık güncel index.js'i okuyacak

dotenv.config();
const app = express();

if (process.env.NODE_ENV !== 'production') {
  app.disable('view cache');
  console.log("!!! Express view cache KAPATILDI !!!");
}

const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session ve Flash
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        // maxAge: ... (kaldırıldı, tarayıcı kapanana kadar sürer)
    }
}));
app.use(flash()); 

// Global Değişkenler
app.use((req, res, next) => {
    res.locals.isAdminLoggedIn = req.session.isLoggedIn || false; 
    res.locals.isUserLoggedIn = req.session.isUserLoggedIn || false; 
    res.locals.currentUser = req.session.user || null; 
    res.locals.success_msg = req.flash('success_msg'); 
    res.locals.error_msg = req.flash('error_msg');   
    next();
});

// --- ROTALAR ---
app.use('/', viewRoutes);                 
app.use('/', userAuthRoutes);             
app.use('/admin', authRoutes);            
app.use('/admin', courseRoutes);          
app.use('/admin', noteRoutes);
app.use('/admin', assignmentRoutes);
app.use('/admin', appointmentRoutes); // Randevu rotasını ekledik
app.use('/forum', ensureUserLoggedIn, forumRoutes);

// Sunucuyu Başlatma
async function startServer() {
    try {
        await db.sequelize.authenticate();
        console.log('Veritabanı bağlantısı başarıyla kuruldu.'); 

        // -----------------------------------------------------------------
        // ADIM 3: Veritabanını Yeniden Oluştur (force: true)
        // -----------------------------------------------------------------
        // Bu komut, veritabanı tablolarınızı (içindeki tüm verilerle birlikte!)
        // SİLECEK ve 'index.js' dosyanızdaki TÜM modellere (Post, Reply, Assignment, Appointment)
        // %100 uyan yeni, doğru sütunlu tabloları oluşturacaktır.
        
        await db.sequelize.sync({ force: false }); // DİKKAT: force: true
        
        console.log('Tablolar başarıyla senkronize edildi (force: true).'); 
        // -----------------------------------------------------------------

        app.listen(PORT, () => {
            console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`); 
        });
    } catch (error) {
        console.error('Veritabanına bağlanılamadı:', error); 
    }
}

// Start the server
startServer();