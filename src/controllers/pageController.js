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
// ... (getHomePage, getCoursePage, getNotePage, getMyNotesPage fonksiyonları aynı kalıyor) ...

// --- YENİ FONKSİYON 1: Ödev Listesi ---
// GET /odevlerim - Tüm ödevleri listeler
exports.getAssignmentsListPage = async (req, res) => {
    try {
        const userId = req.session.user.id;

        // 1. Tüm ödevleri çek
        const allAssignments = await db.Assignment.findAll({
            order: [['dueDate', 'DESC']], // Son teslim tarihine göre sırala
            include: [{ model: db.User, as: 'Teacher', attributes: ['username'] }] // Hocanın adını al
        });

        // 2. Öğrencinin zaten teslim ettiklerini bul
        const userSubmissions = await db.Submission.findAll({
            where: { userId: userId },
            attributes: ['assignmentId'] // Sadece ödev ID'lerini al
        });
        // Teslim edilenlerin ID'lerini bir sete at (daha hızlı kontrol için)
        const submittedIds = new Set(userSubmissions.map(sub => sub.assignmentId));

        // 3. Ödev listesini, öğrencinin teslim edip etmediği bilgisiyle birleştir
        const assignmentsWithStatus = allAssignments.map(assignment => {
            return {
                ...assignment.get({ plain: true }), // Sequelize nesnesini basitleştir
                isSubmitted: submittedIds.has(assignment.id) // Teslim edilmiş mi? (true/false)
            };
        });

        res.render('pages/assignments-list', {
            title: 'Ödevlerim',
            assignments: assignmentsWithStatus
        });
    } catch (error) {
        console.error("Get Assignments List Error:", error);
        req.flash('error_msg', 'Ödevler yüklenirken bir hata oluştu.');
        res.redirect('/');
    }
};

// --- YENİ FONKSİYON 2: Ödev Detay/Teslim Sayfası ---
// GET /odevler/:id - Tek bir ödevi ve teslim formunu gösterir
exports.getSingleAssignmentPage = async (req, res) => {
    try {
        const assignmentId = req.params.id;
        const userId = req.session.user.id;

        // Ödevi ve hocanın bilgilerini çek
        const assignment = await db.Assignment.findByPk(assignmentId, {
            include: [{ model: db.User, as: 'Teacher', attributes: ['username'] }]
        });

        if (!assignment) {
            req.flash('error_msg', 'Ödev bulunamadı.');
            return res.redirect('/odevlerim');
        }

        // Öğrencinin bu ödeve daha önce teslim yapıp yapmadığını kontrol et
        const existingSubmission = await db.Submission.findOne({
            where: {
                assignmentId: assignmentId,
                userId: userId
            }
        });

        res.render('pages/assignment-detail', {
            title: assignment.title,
            assignment: assignment,
            submission: existingSubmission // Eğer varsa teslim bilgisi, yoksa null
        });
    } catch (error) {
        console.error("Get Single Assignment Error:", error);
        req.flash('error_msg', 'Ödev detayı yüklenirken bir hata oluştu.');
        res.redirect('/odevlerim');
    }
};
// ... (getHomePage, getCoursePage, getNotePage, getMyNotesPage, getAssignmentsListPage, getSingleAssignmentPage fonksiyonları aynı kalıyor) ...

// --- YENİ FONKSİYON: Ödev Teslim Etme ---
// POST /odev-teslim - Öğrencinin ödev teslimini işler
exports.postSubmission = async (req, res) => {
    const { assignmentId, textSubmission } = req.body;
    const userId = req.session.user.id;
    const backURL = `/odevler/${assignmentId}`; // Başarıda veya hatada geri dönülecek adres

    try {
        // 1. Dosya yüklendi mi?
        let filePath = null;
        if (req.file) {
            // app.js'de /uploads'ı statik yaptığımız için bu yol çalışacak
            filePath = `/uploads/submissions/${req.file.filename}`;
        }

        // 2. En az bir şey teslim edildi mi?
        if (!textSubmission && !filePath) {
            req.flash('error_msg', 'Lütfen bir metin girin veya bir dosya yükleyin.');
            return res.redirect(backURL);
        }

        // 3. Bu ödeve zaten teslim yapılmış mı?
        const existingSubmission = await db.Submission.findOne({
            where: { assignmentId: assignmentId, userId: userId }
        });

        if (existingSubmission) {
            req.flash('error_msg', 'Bu ödeve zaten bir teslim yapmışsınız.');
            return res.redirect(backURL);
            // İleride "güncelleme" mantığı buraya eklenebilir.
        }

        // 4. Yeni teslimi veritabanına oluştur
        await db.Submission.create({
            assignmentId: assignmentId,
            userId: userId,
            textSubmission: textSubmission || null, // Metin yoksa null
            filePath: filePath // Dosya yoksa null
        });

        req.flash('success_msg', 'Ödeviniz başarıyla teslim edildi!');
        res.redirect(backURL);

    } catch (error) {
        console.error("Submission Error:", error);
        // Multer dosya tipi hatasını yakala
        if (error.message && error.message.includes('Sadece PDF')) {
            req.flash('error_msg', error.message);
        } else {
            req.flash('error_msg', 'Ödev teslim edilirken bir hata oluştu.');
        }
        res.redirect(backURL);
    }
};