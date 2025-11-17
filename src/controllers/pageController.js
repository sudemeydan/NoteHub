const db = require('../models');
const { Op } = require('sequelize'); // Arama (LIKE) için Op'u import et

// GET / - Ana sayfayı gösterir (Son notlar ve popüler notları da çeker)
exports.getHomePage = async (req, res) => {
    try {
        const [courses, latestNotes, popularNotes] = await Promise.all([
            db.Course.findAll({ order: [['title', 'ASC']] }),
            db.Note.findAll({
                limit: 5,
                order: [['createdAt', 'DESC']],
                include: [db.Course]
            }),
            db.Note.findAll({
                limit: 3,
                order: db.sequelize.literal('RAND()'),
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
                order: [['createdAt', 'DESC']]
            }]
        });
        if (!course) {
             req.flash('error_msg', 'Ders bulunamadı.');
             return res.redirect('/');
        }
        res.render('pages/course', {
            title: course.title,
            course: course
        });
    } catch (error) {
        console.error("Course Page Error:", error);
         req.flash('error_msg', 'Sayfa yüklenirken bir hata oluştu.');
         res.redirect('/');
    }
};

// GET /notlar/:id - Tek bir notun içeriğini gösterir (Giriş Gerekli)
exports.getNotePage = async (req, res) => {
    try {
        const note = await db.Note.findByPk(req.params.id, {
            include: [db.Course]
        });
        if (!note) {
             req.flash('error_msg', 'Not bulunamadı.');
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
        res.render('pages/my-notes', {
            title: 'Notlarım',
        });
    } catch (error) {
        console.error("My Notes Page Error:", error);
        req.flash('error_msg', 'Sayfa yüklenirken bir hata oluştu.');
        res.redirect('/');
    }
};

// GET /odevlerim - Tüm ödevleri listeler
exports.getAssignmentsListPage = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const allAssignments = await db.Assignment.findAll({
            order: [['dueDate', 'DESC']],
            include: [{ model: db.User, as: 'Teacher', attributes: ['username'] }]
        });
        const userSubmissions = await db.Submission.findAll({
            where: { userId: userId },
            attributes: ['assignmentId']
        });
        const submittedIds = new Set(userSubmissions.map(sub => sub.assignmentId));
        const assignmentsWithStatus = allAssignments.map(assignment => ({
            ...assignment.get({ plain: true }),
            isSubmitted: submittedIds.has(assignment.id)
        }));
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

// GET /odevler/:id - Tek bir ödevi ve teslim formunu gösterir
exports.getSingleAssignmentPage = async (req, res) => {
    try {
        const assignmentId = req.params.id;
        const userId = req.session.user.id;
        const assignment = await db.Assignment.findByPk(assignmentId, {
            include: [{ model: db.User, as: 'Teacher', attributes: ['username'] }]
        });
        if (!assignment) {
            req.flash('error_msg', 'Ödev bulunamadı.');
            return res.redirect('/odevlerim');
        }
        const existingSubmission = await db.Submission.findOne({
            where: { assignmentId: assignmentId, userId: userId }
        });
        res.render('pages/assignment-detail', {
            title: assignment.title,
            assignment: assignment,
            submission: existingSubmission
        });
    } catch (error) {
        console.error("Get Single Assignment Error:", error);
        req.flash('error_msg', 'Ödev detayı yüklenirken bir hata oluştu.');
        res.redirect('/odevlerim');
    }
};

// POST /odev-teslim - Öğrencinin ödev teslimini işler
exports.postSubmission = async (req, res) => {
    const { assignmentId, textSubmission } = req.body;
    const userId = req.session.user.id;
    const backURL = `/odevler/${assignmentId}`;
    try {
        let filePath = null;
        if (req.file) {
            filePath = `/uploads/submissions/${req.file.filename}`;
        }
        if (!textSubmission && !filePath) {
            req.flash('error_msg', 'Lütfen bir metin girin veya bir dosya yükleyin.');
            return res.redirect(backURL);
        }
        const existingSubmission = await db.Submission.findOne({
            where: { assignmentId: assignmentId, userId: userId }
        });
        if (existingSubmission) {
            req.flash('error_msg', 'Bu ödeve zaten bir teslim yapmışsınız.');
            return res.redirect(backURL);
        }
        await db.Submission.create({
            assignmentId: assignmentId,
            userId: userId,
            textSubmission: textSubmission || null,
            filePath: filePath
        });
        req.flash('success_msg', 'Ödeviniz başarıyla teslim edildi!');
        res.redirect(backURL);
    } catch (error) {
        if (error.message && error.message.includes('Sadece PDF')) {
            req.flash('error_msg', error.message);
        } else {
            req.flash('error_msg', 'Ödev teslim edilirken bir hata oluştu.');
        }
        res.redirect(backURL);
    }
};

// GET /arama?term=... - Canlı arama fonksiyonu
exports.search = async (req, res) => {
    const searchTerm = req.query.term;
    if (!searchTerm || searchTerm.trim() === '') {
        return res.json([]);
    }
    try {
        const notes = await db.Note.findAll({
            where: { title: { [Op.like]: `%${searchTerm}%` } },
            limit: 5,
            attributes: ['id', 'title']
        });
        const courses = await db.Course.findAll({
            where: { title: { [Op.like]: `%${searchTerm}%` } },
            limit: 3,
            attributes: ['id', 'title']
        });
        const noteResults = notes.map(note => ({
            title: note.title,
            url: `/notlar/${note.id}`,
            type: 'Not'
        }));
        const courseResults = courses.map(course => ({
            title: course.title,
            url: `/dersler/${course.id}`,
            type: 'Ders'
        }));
        const results = [...noteResults, ...courseResults];
        res.json(results);
    } catch (error) {
        console.error("Search Error:", error);
        res.status(500).json({ error: 'Arama sırasında bir hata oluştu.' });
    }
};