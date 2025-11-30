const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');
const flash = require('connect-flash');
// Middleware importunu garantiye alıyoruz
const { ensureUserLoggedIn } = require('./src/middlewares/authMiddleware'); 

const viewRoutes = require('./src/routes/viewRoutes');
const userAuthRoutes = require('./src/routes/userAuthRoutes');
const authRoutes = require('./src/routes/authRoutes'); 
const courseRoutes = require('./src/routes/courseRoutes');
const noteRoutes = require('./src/routes/noteRoutes');
const assignmentRoutes = require('./src/routes/assignmentRoutes');
const forumRoutes = require('./src/routes/forumRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes');

const db = require('./src/models');

dotenv.config();
const app = express();

if (process.env.NODE_ENV !== 'production') {
  app.disable('view cache');
  console.log("!!! Express view cache KAPATILDI !!!");
}

const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {}
}));
app.use(flash()); 

app.use((req, res, next) => {
    res.locals.isAdminLoggedIn = req.session.isLoggedIn || false; 
    res.locals.isUserLoggedIn = req.session.isUserLoggedIn || false; 
    res.locals.currentUser = req.session.user || null; 
    res.locals.success_msg = req.flash('success_msg'); 
    res.locals.error_msg = req.flash('error_msg');   
    next();
});

// Rotaları Kullan
app.use('/', viewRoutes);                 
app.use('/', userAuthRoutes);             
app.use('/admin', authRoutes);            
app.use('/admin', courseRoutes);          
app.use('/admin', noteRoutes);
app.use('/admin', assignmentRoutes);
app.use('/admin', appointmentRoutes);
// Burada ensureUserLoggedIn artık undefined olmayacak
app.use('/forum', ensureUserLoggedIn, forumRoutes);

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