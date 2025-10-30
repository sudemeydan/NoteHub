const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');
const flash = require('connect-flash');
const assignmentRoutes = require('./src/routes/assignmentRoutes'); // <-- YENİ
const { ensureUserLoggedIn } = require('./src/middlewares/authMiddleware'); // Bu zaten var
const forumRoutes = require('./src/routes/forumRoutes'); // YENİ EKLENDİ
const noteRoutes = require('./src/routes/noteRoutes');
const userAuthRoutes = require('./src/routes/userAuthRoutes');




// Import database and models
const db = require('./src/models');

dotenv.config();
const app = express();
// --- YENİ EKLENEN KOD ---
// Geliştirme ortamında EJS view cache'ini kapat
if (process.env.NODE_ENV !== 'production') {
  app.disable('view cache');
  console.log("!!! Express view cache KAPATILDI !!!"); // Terminalde görmek için
}
// --- YENİ KOD SONU ---
const PORT = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// Middleware for static files and form data parsing
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Make uploads folder accessible
app.use(express.urlencoded({ extended: true }));

// Session and Flash Middleware configuration
app.use(session({
    secret: process.env.SESSION_SECRET, // Use a strong secret from .env
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // Cookie valid for 1 day
    }
}));
app.use(flash()); // Enable flash messages

// Global variables middleware (accessible in all views)
// UPDATED: Now checks for both admin and regular user sessions
app.use((req, res, next) => {
    res.locals.isAdminLoggedIn = req.session.isLoggedIn || false; // Check admin login status
    res.locals.isUserLoggedIn = req.session.isUserLoggedIn || false; // Check regular user login status
    res.locals.currentUser = req.session.user || null; // User info (id, username, role) from session
    res.locals.success_msg = req.flash('success_msg'); // Success flash messages
    res.locals.error_msg = req.flash('error_msg');   // Error flash messages
    next();
});

// --- ROUTE DEFINITIONS ---
const viewRoutes = require('./src/routes/viewRoutes.js');           // Routes for public pages (home, course, note)
const authRoutes = require('./src/routes/authRoutes');             // Routes for ADMIN authentication (login, logout, dashboard)
const courseRoutes = require('./src/routes/courseRoutes');         // Routes for ADMIN course management (create, delete)

// --- REGISTERING ROUTES ---
app.use('/', viewRoutes);                 // Handle '/', '/dersler/:id', '/notlar/:id'
app.use('/', userAuthRoutes);             // **NEW**: Handle '/kayit', '/giris', '/cikis' (No '/admin' prefix!)
app.use('/admin', authRoutes);            // Handle '/admin/', '/admin/login', '/admin/logout', '/admin/dashboard'
app.use('/admin', courseRoutes);          // Handle '/admin/courses/create', '/admin/courses/:id', '/admin/courses/delete'
app.use('/admin', noteRoutes);
app.use('/admin', assignmentRoutes); // <-- YENİ            // Handle '/admin/notes/create', '/admin/notes/delete', '/admin/notes/edit/:id', '/admin/notes/update'


// ... (diğer app.use satırları) ...
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Bu satır zaten vardı, harika!
// Forum resimleri için 'public/uploads' klasörünü de statik yapalım
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
// ...
app.use('/forum', ensureUserLoggedIn, forumRoutes);

// Function to connect to DB and start the server
async function startServer() {
    try {
        await db.sequelize.authenticate();
        console.log('Veritabanı bağlantısı başarıyla kuruldu.'); // Database connection successful

        await db.sequelize.sync({ force: false }); // Sync models with the database
        console.log('Tablolar başarıyla senkronize edildi.'); // Tables synced

        app.listen(PORT, () => {
            console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`); // Server is running
        });
    } catch (error) {
        console.error('Veritabanına bağlanılamadı:', error); // Database connection failed
    }
}

// Start the server
startServer();