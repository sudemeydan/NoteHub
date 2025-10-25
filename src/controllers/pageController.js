const db = require('../models');

// GET / - Ana sayfayı gösterir
exports.getHomePage = async (req, res) => {
    try {
        const [courses, latestNotes, popularNotes] = await Promise.all([
            // Tüm dersleri çek
            db.Course.findAll({ 
                order: [['title', 'ASC']] // Dersleri başlığa göre sırala
            }),
            // Son 5 notu, ait olduğu dersle birlikte çek (Slider için)
            db.Note.findAll({
                limit: 5,
                order: [['createdAt', 'DESC']],
                include: [db.Course]
            }),
            // Rastgele 3 popüler not çek (Sidebar için - şimdilik rastgele)
            db.Note.findAll({
                limit: 3,
                order: db.sequelize.literal('RAND()'), // PostgreSQL'de 'RANDOM()', MySQL'de 'RAND()'
                include: [db.Course]
            })
        ]);

        res.render('pages/index', {
            title: 'Ana Sayfa',
            courses: courses,
            latestNotes: latestNotes,
            popularNotes: popularNotes // Yeni veriyi view'e gönder
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Sayfa yüklenirken bir hata oluştu.');
    }
};

// GET /dersler/:id - Tek bir dersin notlarını listeler
exports.getCoursePage = async (req, res) => {
    try {
        const course = await db.Course.findByPk(req.params.id, {
            include: [{
                model: db.Note,
                order: [['createdAt', 'DESC']]
            }]
        });

        if (!course) {
            return res.status(404).send('Ders bulunamadı.');
        }

        res.render('pages/course', {
            title: course.title,
            course: course
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Sayfa yüklenirken bir hata oluştu.');
    }
};

// GET /notlar/:id - Tek bir notun içeriğini gösterir
exports.getNotePage = async (req, res) => {
    try {
        const note = await db.Note.findByPk(req.params.id, {
            include: [db.Course]
        });

        if (!note) {
            return res.status(404).send('Not bulunamadı.');
        }

        res.render('pages/note', {
            title: note.title,
            note: note
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Sayfa yüklenirken bir hata oluştu.');
    }
};