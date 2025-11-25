const db = require('../models');
const { Op } = require('sequelize'); 

// GET / - Ana sayfa
exports.getHomePage = async (req, res) => {
    try {
        const [courses, latestNotes, popularNotes] = await Promise.all([
            db.Course.findAll({ order: [['title', 'ASC']] }),
            db.Note.findAll({ limit: 5, order: [['createdAt', 'DESC']], include: [db.Course] }),
            db.Note.findAll({ limit: 3, order: db.sequelize.literal('RAND()'), include: [db.Course] })
        ]);
        res.render('pages/index', { title: 'Ana Sayfa', courses, latestNotes, popularNotes });
    } catch (error) {
        res.status(500).send('Hata oluştu.');
    }
};

// GET /dersler/:id - GÜNCELLENDİ (Ders Gizliliği Kontrolü)
exports.getCoursePage = async (req, res) => {
    try {
        const course = await db.Course.findByPk(req.params.id, {
            include: [{ model: db.Note, order: [['createdAt', 'DESC']] }]
        });

        if (!course) {
             req.flash('error_msg', 'Ders bulunamadı.');
             return res.redirect('/');
        }

        // --- GÜVENLİK KONTROLÜ ---
        // Eğer ders gizliyse (isPublic: false) VE kullanıcı giriş yapmamışsa -> Girişe Yönlendir
        if (!course.isPublic && !req.session.isUserLoggedIn && !req.session.isLoggedIn) {
             req.flash('error_msg', 'Bu ders içeriği sadece kayıtlı üyelere özeldir. Lütfen giriş yapın.');
             return res.redirect('/giris');
        }
        // ------------------------

        res.render('pages/course', { title: course.title, course });
    } catch (error) {
         res.redirect('/');
    }
};

// GET /notlar/:id - GÜNCELLENDİ (Ders Gizliliği Kontrolü)
exports.getNotePage = async (req, res) => {
    try {
        // Notu, bağlı olduğu ders (Course) bilgisiyle birlikte çekiyoruz
        const note = await db.Note.findByPk(req.params.id, { include: [db.Course] });
        
        if (!note) return res.redirect('/');

        // --- GÜVENLİK KONTROLÜ ---
        // Notun bağlı olduğu DERS gizliyse VE kullanıcı giriş yapmamışsa -> Girişe Yönlendir
        if (!note.Course.isPublic && !req.session.isUserLoggedIn && !req.session.isLoggedIn) {
             req.flash('error_msg', 'Bu içerik sadece kayıtlı üyelere özeldir. Lütfen giriş yapın.');
             return res.redirect('/giris');
        }
        // ------------------------

        res.render('pages/note', { title: note.title, note });
    } catch (error) {
        res.redirect('/');
    }
};

// GET /notlarim
exports.getMyNotesPage = async (req, res) => {
    res.render('pages/my-notes', { title: 'Notlarım' });
};

// GET /odevlerim
exports.getAssignmentsListPage = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const allAssignments = await db.Assignment.findAll({
            order: [['dueDate', 'DESC']],
            include: [{ model: db.User, as: 'Teacher', attributes: ['username'] }]
        });
        const userSubmissions = await db.Submission.findAll({ where: { userId }, attributes: ['assignmentId'] });
        const submittedIds = new Set(userSubmissions.map(sub => sub.assignmentId));
        const assignmentsWithStatus = allAssignments.map(assignment => ({
            ...assignment.get({ plain: true }),
            isSubmitted: submittedIds.has(assignment.id)
        }));
        res.render('pages/assignments-list', { title: 'Ödevlerim', assignments: assignmentsWithStatus });
    } catch (error) {
        res.redirect('/');
    }
};

// GET /odevler/:id
exports.getSingleAssignmentPage = async (req, res) => {
    try {
        const assignmentId = req.params.id;
        const userId = req.session.user.id;
        const assignment = await db.Assignment.findByPk(assignmentId, { include: [{ model: db.User, as: 'Teacher', attributes: ['username'] }] });
        if (!assignment) return res.redirect('/odevlerim');
        const existingSubmission = await db.Submission.findOne({ where: { assignmentId, userId } });
        res.render('pages/assignment-detail', { title: assignment.title, assignment, submission: existingSubmission });
    } catch (error) {
        res.redirect('/odevlerim');
    }
};

// POST /odev-teslim
exports.postSubmission = async (req, res) => {
    const { assignmentId, textSubmission } = req.body;
    const userId = req.session.user.id;
    try {
        let filePath = null;
        if (req.file) filePath = `/uploads/submissions/${req.file.filename}`;
        if (!textSubmission && !filePath) { req.flash('error_msg', 'Eksik bilgi.'); return res.redirect(`/odevler/${assignmentId}`); }
        const existingSubmission = await db.Submission.findOne({ where: { assignmentId, userId } });
        if (existingSubmission) { req.flash('error_msg', 'Zaten teslim edildi.'); return res.redirect(`/odevler/${assignmentId}`); }
        await db.Submission.create({ assignmentId, userId, textSubmission, filePath });
        req.flash('success_msg', 'Teslim edildi!'); res.redirect(`/odevler/${assignmentId}`);
    } catch (error) {
        res.redirect(`/odevler/${assignmentId}`);
    }
};

// GET /arama
exports.search = async (req, res) => {
    const searchTerm = req.query.term;
    if (!searchTerm) return res.json([]);
    try {
        const notes = await db.Note.findAll({ where: { title: { [Op.like]: `%${searchTerm}%` } }, limit: 5, include: [db.Course] });
        const courses = await db.Course.findAll({ where: { title: { [Op.like]: `%${searchTerm}%` } }, limit: 3 });
        
        // Arama sonuçlarını filtrele: Gizli olanları gösterme (eğer giriş yapmamışsa)
        // Ancak basitlik için şimdilik hepsini gösteriyoruz, tıklayınca zaten giremeyecekler.
        
        const results = [
            ...notes.map(n => ({ title: n.title, url: `/notlar/${n.id}`, type: 'Not' })),
            ...courses.map(c => ({ title: c.title, url: `/dersler/${c.id}`, type: 'Ders' }))
        ];
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Hata' });
    }
};

// GET /randevu-al (TAKVİM SAYFASI)
exports.getCalendarPage = async (req, res) => {
    try {
        const teacher = await db.User.findOne({ where: { role: 'admin' } });
        if (!teacher) return res.redirect('/');
        
        const busySlots = await db.Appointment.findAll({
            where: {
                teacherId: teacher.id,
                status: 'busy',
                startTime: { [Op.gte]: new Date() }
            },
            order: [['startTime', 'ASC']]
        });
        
        res.render('pages/calendar', { title: 'Randevu Al', teacherId: teacher.id, busySlots });
    } catch (error) {
        res.redirect('/');
    }
};

// POST /randevu-talep
exports.createAppointmentRequest = async (req, res) => {
    const { teacherId, appointmentDate, appointmentTime, studentNotes } = req.body;
    const studentId = req.session.user.id;
    try {
        const startTime = new Date(`${appointmentDate}T${appointmentTime}`);
        const endTime = new Date(startTime.getTime() + 30 * 60000);
        if (startTime < new Date()) { req.flash('error_msg', 'Geçmiş zaman.'); return res.redirect('/randevu-al'); }

        const existing = await db.Appointment.findOne({
            where: {
                teacherId,
                status: { [Op.in]: ['busy', 'confirmed', 'pending'] },
                [Op.or]: [{ startTime: { [Op.lt]: endTime }, endTime: { [Op.gt]: startTime } }]
            }
        });

        if (existing) {
            req.flash('error_msg', 'Bu saat dolu.');
            return res.redirect('/randevu-al');
        }

        await db.Appointment.create({ startTime, endTime, status: 'pending', studentNotes, teacherId, studentId });
        req.flash('success_msg', 'Talep gönderildi.'); res.redirect('/randevularim');
    } catch (error) {
        res.redirect('/randevu-al');
    }
};

// GET /randevularim
exports.getStudentAppointmentsPage = async (req, res) => {
    try {
        const appointments = await db.Appointment.findAll({
            where: { studentId: req.session.user.id },
            include: [{ model: db.User, as: 'Teacher' }],
            order: [['startTime', 'DESC']]
        });
        res.render('pages/student-appointments', { title: 'Randevularım', appointments });
    } catch (error) {
        res.redirect('/');
    }
};