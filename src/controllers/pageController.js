const db = require('../models');
const { Op } = require('sequelize');
const nodemailer = require('nodemailer');

// GET / - Ana sayfa (ESKİ HALİ: Dersleri gönderir)
const getHomePage = async (req, res) => {
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

// ... (AŞAĞIDAKİ DİĞER FONKSİYONLARINIZ AYNI KALABİLİR) ...
// getCoursePage, getNotePage, getMyNotesPage, getAssignmentsListPage, 
// getSingleAssignmentPage, postSubmission, search, getCalendarPage, 
// createAppointmentRequest, getStudentAppointmentsPage

const getCoursePage = async (req, res) => {
    try {
        const course = await db.Course.findByPk(req.params.id, {
            include: [{ model: db.Note, order: [['createdAt', 'DESC']] }]
        });

        if (!course) {
             req.flash('error_msg', 'Ders bulunamadı.');
             return res.redirect('/');
        }

        if (!course.isPublic && !req.session.isUserLoggedIn && !req.session.isLoggedIn) {
             req.flash('error_msg', 'Bu ders sadece kayıtlı üyelere özeldir.');
             return res.redirect('/giris');
        }

        res.render('pages/course', { title: course.title, course });
    } catch (error) {
         res.redirect('/');
    }
};

const getNotePage = async (req, res) => {
    try {
        const note = await db.Note.findByPk(req.params.id, { include: [db.Course] });
        if (!note) return res.redirect('/');

        if (!note.Course.isPublic && !req.session.isUserLoggedIn && !req.session.isLoggedIn) {
             req.flash('error_msg', 'Bu içerik sadece kayıtlı üyelere özeldir.');
             return res.redirect('/giris');
        }
        res.render('pages/note', { title: note.title, note });
    } catch (error) { res.redirect('/'); }
};

const getMyNotesPage = async (req, res) => {
    res.render('pages/my-notes', { title: 'Notlarım' });
};

const getAssignmentsListPage = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const all = await db.Assignment.findAll({ order: [['dueDate', 'DESC']], include: [{ model: db.User, as: 'Teacher', attributes: ['username'] }] });
        const subs = await db.Submission.findAll({ where: { userId }, attributes: ['assignmentId'] });
        const subIds = new Set(subs.map(s => s.assignmentId));
        const assignments = all.map(a => ({ ...a.get({ plain: true }), isSubmitted: subIds.has(a.id) }));
        res.render('pages/assignments-list', { title: 'Ödevlerim', assignments });
    } catch (e) { res.redirect('/'); }
};

const getSingleAssignmentPage = async (req, res) => {
    try {
        const assignment = await db.Assignment.findByPk(req.params.id, { include: [{ model: db.User, as: 'Teacher', attributes: ['username'] }] });
        if (!assignment) return res.redirect('/odevlerim');
        const submission = await db.Submission.findOne({ where: { assignmentId: req.params.id, userId: req.session.user.id } });
        res.render('pages/assignment-detail', { title: assignment.title, assignment, submission });
    } catch (e) { res.redirect('/odevlerim'); }
};

const postSubmission = async (req, res) => {
    try {
        const { assignmentId, textSubmission } = req.body;
        let filePath = req.file ? `/uploads/submissions/${req.file.filename}` : null;
        if (!textSubmission && !filePath) { req.flash('error_msg', 'Boş gönderilemez.'); return res.redirect(`/odevler/${assignmentId}`); }
        
        const exists = await db.Submission.findOne({ where: { assignmentId, userId: req.session.user.id } });
        if (exists) { req.flash('error_msg', 'Zaten teslim ettiniz.'); return res.redirect(`/odevler/${assignmentId}`); }

        await db.Submission.create({ assignmentId, userId: req.session.user.id, textSubmission, filePath });
        req.flash('success_msg', 'Teslim edildi.'); res.redirect(`/odevler/${assignmentId}`);
    } catch (e) { res.redirect(`/odevler/${req.body.assignmentId}`); }
};

const search = async (req, res) => {
    const term = req.query.term;
    if (!term) return res.json([]);
    try {
        const notes = await db.Note.findAll({ where: { title: { [Op.like]: `%${term}%` } }, limit: 5 });
        const courses = await db.Course.findAll({ where: { title: { [Op.like]: `%${term}%` } }, limit: 3 });
        res.json([...notes.map(n => ({ title: n.title, url: `/notlar/${n.id}`, type: 'Not' })), ...courses.map(c => ({ title: c.title, url: `/dersler/${c.id}`, type: 'Ders' }))]);
    } catch (e) { res.status(500).json({ error: 'Hata' }); }
};

const getCalendarPage = async (req, res) => {
    try {
        const teacher = await db.User.findOne({ where: { role: 'admin' } });
        if (!teacher) return res.redirect('/');
        const busySlots = await db.Appointment.findAll({
             where: { teacherId: teacher.id, status: 'busy' },
             order: [['startTime', 'ASC']] 
        });
        res.render('pages/calendar', { title: 'Randevu Al', teacherId: teacher.id, busySlots });
    } catch (e) { res.redirect('/'); }
};

const createAppointmentRequest = async (req, res) => {
    try {
        const { teacherId, appointmentDate, appointmentTime, studentNotes } = req.body;
        const start = new Date(`${appointmentDate}T${appointmentTime}`);
        const end = new Date(start.getTime() + 30 * 60000);
        
        const conflict = await db.Appointment.findOne({
            where: { teacherId, status: { [Op.in]: ['busy', 'confirmed', 'pending'] }, [Op.or]: [{ startTime: { [Op.lt]: end }, endTime: { [Op.gt]: start } }] }
        });
        if (conflict) { req.flash('error_msg', 'Bu saat dolu.'); return res.redirect('/randevu-al'); }

        await db.Appointment.create({ startTime: start, endTime: end, status: 'pending', studentNotes, teacherId, studentId: req.session.user.id });
        
        // --- MAIL GÖNDERME ---
        const teacher = await db.User.findByPk(teacherId);
        const student = req.session.user;

        if (teacher && teacher.email) {
             const transporter = nodemailer.createTransport({
                service: process.env.EMAIL_SERVICE,
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
            });
            const mailOptions = {
                from: `"NoteHub" <${process.env.EMAIL_USER}>`,
                to: teacher.email,
                replyTo: student.email,
                subject: `📅 Yeni Randevu Talebi: ${student.username}`,
                html: `<p>${student.username} (${student.email}) sizden <b>${appointmentDate} ${appointmentTime}</b> için randevu talep etti.</p><p>Not: ${studentNotes}</p>`
            };
            transporter.sendMail(mailOptions).catch(err => console.error("Mail Hatası:", err));
        }
        // ---------------------

        req.flash('success_msg', 'Talep iletildi.'); res.redirect('/randevularim');
    } catch (e) { 
        console.error(e);
        res.redirect('/randevu-al'); 
    }
};

const getStudentAppointmentsPage = async (req, res) => {
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

// Hepsini tek seferde dışa aktar
module.exports = {
    getHomePage,
    getCoursePage,
    getNotePage,
    getMyNotesPage,
    getAssignmentsListPage,
    getSingleAssignmentPage,
    postSubmission,
    search,
    getCalendarPage,
    createAppointmentRequest,
    getStudentAppointmentsPage
};