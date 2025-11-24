const db = require('../models');
const { Op } = require('sequelize');

// ... (getHomePage, getCoursePage, getNotePage, getMyNotesPage, getAssignmentsListPage, getSingleAssignmentPage, postSubmission, search fonksiyonları AYNI KALIYOR) ...

// GET / - Ana sayfayı gösterir
exports.getHomePage = async (req, res) => {
    try {
        const [courses, latestNotes, popularNotes] = await Promise.all([
            db.Course.findAll({ order: [['title', 'ASC']] }),
            db.Note.findAll({ limit: 5, order: [['createdAt', 'DESC']], include: [db.Course] }),
            db.Note.findAll({ limit: 3, order: db.sequelize.literal('RAND()'), include: [db.Course] })
        ]);
        res.render('pages/index', { title: 'Ana Sayfa', courses, latestNotes, popularNotes });
    } catch (error) {
        console.error("Home Page Error:", error);
        res.status(500).send('Sayfa yüklenirken bir hata oluştu.');
    }
};

// GET /dersler/:id
exports.getCoursePage = async (req, res) => {
    try {
        const course = await db.Course.findByPk(req.params.id, {
            include: [{ model: db.Note, order: [['createdAt', 'DESC']] }]
        });
        if (!course) { req.flash('error_msg', 'Ders bulunamadı.'); return res.redirect('/'); }
        res.render('pages/course', { title: course.title, course });
    } catch (error) {
         req.flash('error_msg', 'Hata oluştu.'); res.redirect('/');
    }
};

// GET /notlar/:id
exports.getNotePage = async (req, res) => {
    try {
        const note = await db.Note.findByPk(req.params.id, { include: [db.Course] });
        if (!note) { req.flash('error_msg', 'Not bulunamadı.'); return res.redirect('/'); }
        res.render('pages/note', { title: note.title, note });
    } catch (error) {
        req.flash('error_msg', 'Hata oluştu.'); res.redirect('/');
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
        req.flash('error_msg', 'Hata oluştu.'); res.redirect('/');
    }
};

// GET /odevler/:id
exports.getSingleAssignmentPage = async (req, res) => {
    try {
        const assignmentId = req.params.id;
        const userId = req.session.user.id;
        const assignment = await db.Assignment.findByPk(assignmentId, { include: [{ model: db.User, as: 'Teacher', attributes: ['username'] }] });
        if (!assignment) { req.flash('error_msg', 'Ödev bulunamadı.'); return res.redirect('/odevlerim'); }
        const existingSubmission = await db.Submission.findOne({ where: { assignmentId, userId } });
        res.render('pages/assignment-detail', { title: assignment.title, assignment, submission: existingSubmission });
    } catch (error) {
        req.flash('error_msg', 'Hata oluştu.'); res.redirect('/odevlerim');
    }
};

// POST /odev-teslim
exports.postSubmission = async (req, res) => {
    const { assignmentId, textSubmission } = req.body;
    const userId = req.session.user.id;
    try {
        let filePath = null;
        if (req.file) filePath = `/uploads/submissions/${req.file.filename}`;
        if (!textSubmission && !filePath) { req.flash('error_msg', 'Lütfen metin veya dosya girin.'); return res.redirect(`/odevler/${assignmentId}`); }
        const existingSubmission = await db.Submission.findOne({ where: { assignmentId, userId } });
        if (existingSubmission) { req.flash('error_msg', 'Zaten teslim ettiniz.'); return res.redirect(`/odevler/${assignmentId}`); }
        await db.Submission.create({ assignmentId, userId, textSubmission, filePath });
        req.flash('success_msg', 'Başarıyla teslim edildi!'); res.redirect(`/odevler/${assignmentId}`);
    } catch (error) {
        req.flash('error_msg', 'Hata oluştu.'); res.redirect(`/odevler/${assignmentId}`);
    }
};

// GET /arama
exports.search = async (req, res) => {
    const searchTerm = req.query.term;
    if (!searchTerm || searchTerm.trim() === '') return res.json([]);
    try {
        const notes = await db.Note.findAll({ where: { title: { [Op.like]: `%${searchTerm}%` } }, limit: 5, attributes: ['id', 'title'] });
        const courses = await db.Course.findAll({ where: { title: { [Op.like]: `%${searchTerm}%` } }, limit: 3, attributes: ['id', 'title'] });
        const results = [...notes.map(n => ({ title: n.title, url: `/notlar/${n.id}`, type: 'Not' })), ...courses.map(c => ({ title: c.title, url: `/dersler/${c.id}`, type: 'Ders' }))];
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Hata.' });
    }
};

// GET /randevu-al
exports.getCalendarPage = async (req, res) => {
    try {
        const teacher = await db.User.findOne({ where: { role: 'admin' } });
        if (!teacher) { req.flash('error_msg', 'Eğitmen bulunamadı.'); return res.redirect('/'); }
        const busySlots = await db.Appointment.findAll({
            where: { teacherId: teacher.id, status: { [Op.or]: ['busy', 'confirmed'] }, startTime: { [Op.gte]: new Date() } },
            order: [['startTime', 'ASC']]
        });
        res.render('pages/calendar', { title: 'Randevu Al', teacherId: teacher.id, busySlots });
    } catch (error) {
        req.flash('error_msg', 'Hata oluştu.'); res.redirect('/');
    }
};

// POST /randevu-talep
exports.createAppointmentRequest = async (req, res) => {
    const { teacherId, appointmentDate, appointmentTime, studentNotes } = req.body;
    const studentId = req.session.user.id;
    try {
        if (!appointmentDate || !appointmentTime || !studentNotes) { req.flash('error_msg', 'Tüm alanları doldurun.'); return res.redirect('/randevu-al'); }
        const startTime = new Date(`${appointmentDate}T${appointmentTime}`);
        const endTime = new Date(startTime.getTime() + 30 * 60000);
        if (startTime < new Date()) { req.flash('error_msg', 'Geçmiş zamana randevu alınamaz.'); return res.redirect('/randevu-al'); }
        
        const existingSlot = await db.Appointment.findOne({
            where: { teacherId, status: { [Op.in]: ['busy', 'confirmed', 'pending'] }, [Op.or]: [{ startTime: { [Op.lt]: endTime }, endTime: { [Op.gt]: startTime } }] }
        });
        if (existingSlot) { req.flash('error_msg', 'Seçtiğiniz saat uygun değil.'); return res.redirect('/randevu-al'); }

        await db.Appointment.create({ startTime, endTime, status: 'pending', studentNotes, teacherId, studentId });
        req.flash('success_msg', 'Randevu talebiniz iletildi.'); res.redirect('/randevularim');
    } catch (error) {
        req.flash('error_msg', 'Hata oluştu.'); res.redirect('/randevu-al');
    }
};

// --- YENİ: Öğrencinin Kendi Randevularını Görmesi ---
// GET /randevularim
exports.getStudentAppointmentsPage = async (req, res) => {
    try {
        const studentId = req.session.user.id;
        // Öğrencinin kendi randevularını (pending, confirmed, rejected) çek
        const appointments = await db.Appointment.findAll({
            where: { studentId: studentId },
            include: [{ model: db.User, as: 'Teacher', attributes: ['username'] }],
            order: [['startTime', 'DESC']] // En yeni en üstte
        });

        res.render('pages/student-appointments', {
            title: 'Randevularım',
            appointments: appointments
        });
    } catch (error) {
        console.error("Student Appointments Error:", error);
        req.flash('error_msg', 'Randevularınız yüklenirken hata oluştu.');
        res.redirect('/');
    }
};