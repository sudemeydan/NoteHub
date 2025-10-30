const db = require('../models');

// GET /admin/assignments - Tüm ödevleri ve formu göster
exports.getAssignmentsPage = async (req, res) => {
    try {
        const assignments = await db.Assignment.findAll({
            order: [['createdAt', 'DESC']],
            include: [{ model: db.User, as: 'Teacher', attributes: ['username'] }] // Hangi hocanın verdiğini göster
        });

        res.render('admin/assignments', {
            title: 'Ödev Yönetimi',
            assignments: assignments
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Ödevler yüklenirken bir hata oluştu.');
        res.redirect('/admin/dashboard');
    }
};

// POST /admin/assignments/create - Yeni bir ödev oluşturur
exports.createAssignment = async (req, res) => {
    try {
        const { title, description, dueDate } = req.body;
        const teacherId = req.session.user.id; // Giriş yapmış admin'in ID'si

        let filePath = null;
        if (req.file) {
            filePath = `/uploads/assignments/${req.file.filename}`;
        }

        if (!title) {
            req.flash('error_msg', 'Ödev başlığı zorunludur.');
            return res.redirect('/admin/assignments');
        }

        await db.Assignment.create({
            title: title,
            description: description,
            dueDate: dueDate || null,
            filePath: filePath,
            teacherId: teacherId
        });

        req.flash('success_msg', 'Ödev başarıyla oluşturuldu.');
        res.redirect('/admin/assignments');
    } catch (error) {
        console.error(error);
        if (error.message && error.message.includes('Sadece PDF')) {
            req.flash('error_msg', error.message);
        } else {
            req.flash('error_msg', 'Ödev oluşturulurken bir hata oluştu.');
        }
        res.redirect('/admin/assignments');
    }
};

// --- YENİ FONKSİYON: Teslimleri Listeleme ---
// GET /admin/assignments/:id/submissions - Bir ödeve ait teslimleri gösterir
exports.getAssignmentSubmissionsPage = async (req, res) => {
    try {
        const assignmentId = req.params.id;

        // 1. Önce ödevin kendisini bul
        const assignment = await db.Assignment.findByPk(assignmentId);
        if (!assignment) {
            req.flash('error_msg', 'Ödev bulunamadı.');
            return res.redirect('/admin/assignments');
        }

        // 2. Bu ödeve ait tüm teslimleri (Submissions) bul
        //    ve her teslimin sahibini (User - Öğrenci) de dahil et
        const submissions = await db.Submission.findAll({
            where: { assignmentId: assignmentId },
            include: [{
                model: db.User, // İlişkili User modelini çek
                attributes: ['username'] // Sadece öğrencinin kullanıcı adını al
            }],
            order: [['createdAt', 'DESC']] // Yeniden eskiye sırala
        });

        res.render('admin/submissions', {
            title: `"${assignment.title}" İçin Gelen Teslimler`,
            assignment: assignment,
            submissions: submissions
        });

    } catch (error) {
        console.error("Get Submissions Error:", error);
        req.flash('error_msg', 'Teslimler yüklenirken bir hata oluştu.');
        res.redirect('/admin/assignments');
    }
};