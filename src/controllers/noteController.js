const db = require('../models');

// POST /admin/notes/create - Yeni bir not oluşturur
exports.createNote = async (req, res) => {
    const { title, content, courseId } = req.body; 
    try {
        if (!title || !content || !courseId) {
            req.flash('error_msg', 'Tüm alanlar zorunludur.');
            return res.redirect(`/admin/courses/${courseId}`);
        }

        await db.Note.create({
            title: title,
            content: content,
            courseId: courseId
            // isPublic artık yok, ders ayarından miras alır
        });

        req.flash('success_msg', 'Not başarıyla eklendi.');
        res.redirect(`/admin/courses/${courseId}`);
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
        await note.destroy();
        req.flash('success_msg', 'Not başarıyla silindi.');
        res.redirect(`/admin/courses/${courseId}`);
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
            return res.redirect('/admin/dashboard'); 
        }

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

        note.title = title;
        note.content = content;
        await note.save();

        req.flash('success_msg', 'Not güncellendi.');
        res.redirect(`/admin/courses/${courseId}`);
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Hata oluştu.');
        if (courseId) {
            res.redirect(`/admin/courses/${courseId}`);
        } else {
            res.redirect('/admin/dashboard');
        }
    }
};

// TinyMCE Resim Yükleme
exports.uploadImage = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Dosya yüklenemedi.' });
    }
    const fileUrl = `/uploads/note_images/${req.file.filename}`;
    res.json({ location: fileUrl });
};