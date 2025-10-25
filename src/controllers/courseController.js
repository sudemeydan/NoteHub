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

// --- YENİ EKLENEN FONKSİYON ---
// GET /admin/courses/:id - Tek bir dersin detay sayfasını gösterir
exports.getCourseDetailPage = async (req, res) => {
    try {
        const courseId = req.params.id;
        // İlgili dersi, ilişkili notlarıyla birlikte veritabanından bul
        const course = await db.Course.findByPk(courseId, {
            include: [{
                model: db.Note,
                order: [['createdAt', 'DESC']] // Notları yeniden eskiye sırala
            }] 
        });

        // Eğer ders bulunamazsa, kullanıcıyı panele yönlendir
        if (!course) {
            req.flash('error_msg', 'Ders bulunamadı.');
            return res.redirect('/admin/dashboard');
        }

        // course-detail.ejs dosyasını render et ve 'course' verisini gönder
        res.render('admin/course-detail', {
            course: course
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Sayfa yüklenirken bir hata oluştu.');
        res.redirect('/admin/dashboard');
    }
};
// ... dosyanın başı, createCourse ve getCourseDetailPage fonksiyonları aynı kalıyor ...

// --- YENİ FONKSİYON ---
// POST /admin/courses/delete - Bir dersi (ve notlarını) siler
exports.deleteCourse = async (req, res) => {
    // Formdan gelen 'courseId'yi alıyoruz
    const { courseId } = req.body; 
    try {
        const course = await db.Course.findByPk(courseId);
        if (!course) {
            req.flash('error_msg', 'Silinecek ders bulunamadı.');
            return res.redirect('/admin/dashboard');
        }

        // Dersi veritabanından sil (ilişkili notlar da silinecek)
        await course.destroy();

        req.flash('success_msg', 'Ders ve ilişkili tüm notlar başarıyla silindi.');
        res.redirect('/admin/dashboard'); // Panele geri dön
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Ders silinirken bir hata oluştu.');
        res.redirect('/admin/dashboard');
    }
};