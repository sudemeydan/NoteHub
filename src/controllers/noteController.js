const db = require('../models');

// POST /admin/notes/create - Yeni bir not oluşturur
exports.createNote = async (req, res) => {
    const { title, content, courseId } = req.body; // Formdan gelen veriler
    try {
        if (!title || !content || !courseId) {
            req.flash('error_msg', 'Tüm alanlar zorunludur.');
            return res.redirect(`/admin/courses/${courseId}`);
        }

        await db.Note.create({
            title: title,
            content: content,
            courseId: courseId
        });

        req.flash('success_msg', 'Not başarıyla eklendi.');
        res.redirect(`/admin/courses/${courseId}`); // Aynı ders detay sayfasına geri dön
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Not eklenirken bir hata oluştu.');
        res.redirect(`/admin/courses/${courseId}`);
    }
};

// POST /admin/notes/delete - Bir notu siler
exports.deleteNote = async (req, res) => {
    const { noteId, courseId } = req.body; 
    try {
        const note = await db.Note.findByPk(noteId);
        if (!note) {
            req.flash('error_msg', 'Silinecek not bulunamadı.');
            return res.redirect(`/admin/courses/${courseId}`);
        }

        // Notu veritabanından sil
        await note.destroy();

        req.flash('success_msg', 'Not başarıyla silindi.');
        res.redirect(`/admin/courses/${courseId}`); // Aynı ders detay sayfasına geri dön
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Not silinirken bir hata oluştu.');
        res.redirect(`/admin/courses/${courseId}`);
    }
};

// GET /admin/notes/edit/:id - Düzenleme sayfasını gösterir
exports.getEditNotePage = async (req, res) => {
    try {
        const noteId = req.params.id;
        const note = await db.Note.findByPk(noteId);

        if (!note) {
            req.flash('error_msg', 'Not bulunamadı.');
            return res.redirect('/admin/dashboard'); // Ana panele yönlendir
        }

        // Notu 'edit-note.ejs' sayfasına gönder
        res.render('admin/edit-note', {
            title: 'Notu Düzenle',
            note: note
        });
    } catch (error) {
        console.error(error);
        res.redirect('/admin/dashboard');
    }
};

// POST /admin/notes/update - Düzenlemeyi kaydeder
exports.updateNote = async (req, res) => {
    const { noteId, title, content } = req.body;
    let courseId;

    try {
        const note = await db.Note.findByPk(noteId);

        if (!note) {
            req.flash('error_msg', 'Not bulunamadı.');
            return res.redirect('/admin/dashboard');
        }

        courseId = note.courseId;

        // Notun verilerini güncelle
        note.title = title;
        note.content = content;
        await note.save(); // Değişiklikleri kaydet

        req.flash('success_msg', 'Not başarıyla güncellendi.');
        res.redirect(`/admin/courses/${courseId}`); // Ders detay sayfasına geri dön
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Not güncellenirken bir hata oluştu.');
        if (courseId) {
            res.redirect(`/admin/courses/${courseId}`);
        } else {
            res.redirect('/admin/dashboard');
        }
    }
};