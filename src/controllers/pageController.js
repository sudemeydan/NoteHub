const db = require('../models');

// GET / - Ana sayfayı gösterir (Son notlar ve popüler notları da çeker)
exports.getHomePage = async (req, res) => {
    try {
        const [courses, latestNotes, popularNotes] = await Promise.all([
            // Tüm dersleri çek (Başlığa göre sıralı)
            db.Course.findAll({ 
                order: [['title', 'ASC']] 
            }),
            // Son 5 notu, ait olduğu dersle birlikte çek (Slider için)
            db.Note.findAll({
                limit: 5,
                order: [['createdAt', 'DESC']],
                include: [db.Course]
            }),
            // Rastgele 3 popüler not çek (Sidebar için)
            db.Note.findAll({
                limit: 3,
                order: db.sequelize.literal('RAND()'), // MySQL için RAND()
                include: [db.Course]
            })
        ]);

        res.render('pages/index', {
            title: 'Ana Sayfa',
            courses: courses,
            latestNotes: latestNotes,
            popularNotes: popularNotes 
        });
    } catch (error) {
        console.error("Home Page Error:", error);
        res.status(500).send('Sayfa yüklenirken bir hata oluştu.');
    }
};

// GET /dersler/:id - Tek bir dersin notlarını listeler (Giriş Gerekli)
exports.getCoursePage = async (req, res) => {
    try {
        const course = await db.Course.findByPk(req.params.id, {
            include: [{
                model: db.Note,
                order: [['createdAt', 'DESC']] // Notları yeniden eskiye sırala
            }]
        });

        if (!course) {
             req.flash('error_msg', 'Ders bulunamadı.'); // Flash mesajı ekleyebiliriz
             return res.redirect('/'); // Ana sayfaya yönlendir
        }

        res.render('pages/course', {
            title: course.title,
            course: course
        });
    } catch (error) {
        console.error("Course Page Error:", error);
         req.flash('error_msg', 'Sayfa yüklenirken bir hata oluştu.'); // Flash mesajı
         res.redirect('/');
    }
};

// GET /notlar/:id - Tek bir notun içeriğini gösterir (Giriş Gerekli)
exports.getNotePage = async (req, res) => {
    try {
        const note = await db.Note.findByPk(req.params.id, {
            include: [db.Course] // Notun ait olduğu ders bilgisini de al
        });

        if (!note) {
             req.flash('error_msg', 'Not bulunamadı.');
             // Kullanıcıyı ya ders sayfasına ya da ana sayfaya yönlendir
             const backURL = req.header('Referer') || '/'; 
             return res.redirect(backURL);
        }

        res.render('pages/note', {
            title: note.title,
            note: note
        });
    } catch (error) {
        console.error("Note Page Error:", error);
        req.flash('error_msg', 'Sayfa yüklenirken bir hata oluştu.');
        const backURL = req.header('Referer') || '/'; 
        res.redirect(backURL);
    }
};

// GET /notlarim - Kullanıcının "Notlarım" sayfasını gösterir (Giriş Gerekli)
exports.getMyNotesPage = async (req, res) => {
    try {
        // İleride buraya kullanıcıya özel notları çekme mantığı eklenebilir.
        // Şimdilik sadece sayfayı render ediyoruz.
        // const userNotes = await db.Note.findAll({ where: { userId: req.session.user.id } }); // Örneğin
        
        res.render('pages/my-notes', {
            title: 'Notlarım',
            // notes: userNotes // Gelecekte
        });
    } catch (error) {
        console.error("My Notes Page Error:", error);
        req.flash('error_msg', 'Sayfa yüklenirken bir hata oluştu.');
        res.redirect('/'); // Hata olursa ana sayfaya yönlendir
    }
};