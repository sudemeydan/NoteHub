const db = require('../models');

// POST /admin/courses/create - Yeni bir ders oluşturur
exports.createCourse = async (req, res) => {
    const { title, description } = req.body;
    try {
        if (!title) {
            req.flash('error_msg', 'Ders başlığı boş olamaz.');
            return res.redirect('/admin/dashboard');
        }
        await db.Course.create({
            title,
            description
        });
        req.flash('success_msg', 'Ders başarıyla eklendi.');
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Ders eklenirken bir hata oluştu.');
        res.redirect('/admin/dashboard');
    }
};

// GET /admin/courses/:id - Tek bir dersin detay sayfasını gösterir
exports.getCourseDetailPage = async (req, res) => {
    try {
        const courseId = req.params.id;
        const course = await db.Course.findByPk(courseId, {
            include: [{
                model: db.Note,
                order: [['createdAt', 'DESC']] // Notları yeniden eskiye sırala
            }] 
        });

        if (!course) {
            req.flash('error_msg', 'Ders bulunamadı.');
            return res.redirect('/admin/dashboard');
        }

        res.render('admin/course-detail', {
            course: course
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Sayfa yüklenirken bir hata oluştu.');
        res.redirect('/admin/dashboard');
    }
};

// POST /admin/courses/delete - Bir dersi (ve notlarını) siler
exports.deleteCourse = async (req, res) => {
    const { courseId } = req.body; 
    try {
        const course = await db.Course.findByPk(courseId);
        if (!course) {
            req.flash('error_msg', 'Silinecek ders bulunamadı.');
            return res.redirect('/admin/dashboard');
        }

        await course.destroy();

        req.flash('success_msg', 'Ders ve ilişkili tüm notlar başarıyla silindi.');
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Ders silinirken bir hata oluştu.');
        res.redirect('/admin/dashboard');
    }
};