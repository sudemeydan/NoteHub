const db = require('../models');

// GET /forum - Tüm konuları listeler
exports.getForumPage = async (req, res) => {
    try {
        const posts = await db.Post.findAll({
            include: [db.User], // Konuyu açan kullanıcıyı da al
            order: [['createdAt', 'DESC']]
        });
        res.render('pages/forum', { title: 'Forum', posts });
    } catch (error) {
        console.log(error);
        req.flash('error_msg', 'Forum yüklenirken hata oluştu.');
        res.redirect('/');
    }
};

// GET /forum/yeni - Yeni konu açma formunu gösterir
exports.getNewPostPage = (req, res) => {
    res.render('pages/forum-yeni', { title: 'Yeni Konu Aç' });
};

// POST /forum/yeni - Yeni konuyu veritabanına kaydeder
exports.createNewPost = async (req, res) => {
    const { title, content } = req.body;
    // YENİ KLASÖR YOLU
    const imageUrl = req.file ? `/uploads/forum_images/${req.file.filename}` : null;

    try {
        await db.Post.create({
            title,
            content,
            imageUrl,
            userId: req.session.user.id
        });
        req.flash('success_msg', 'Konu başarıyla açıldı.');
        res.redirect('/forum');
    } catch (error) {
        req.flash('error_msg', 'Konu açılamadı.');
        res.redirect('/forum/yeni');
    }
};

// GET /forum/:id - Tek bir konuyu ve yanıtlarını gösterir
exports.getPostDetailPage = async (req, res) => {
    try {
        const post = await db.Post.findByPk(req.params.id, {
            include: [
                db.User, // Konuyu açan kullanıcı
                {
                    model: db.Reply,
                    include: [db.User], // Yanıtları yazan kullanıcılar
                    order: [['createdAt', 'ASC']]
                }
            ]
        });
        if (!post) {
            req.flash('error_msg', 'Konu bulunamadı.');
            return res.redirect('/forum');
        }
        res.render('pages/forum-detay', { title: post.title, post });
    } catch (error) {
        req.flash('error_msg', 'Konu yüklenirken hata oluştu.');
        res.redirect('/forum');
    }
};

// POST /forum/:id/reply - Bir konuya yanıt ekler
exports.createNewReply = async (req, res) => {
    const { content } = req.body;
    const postId = req.params.id;
    // YENİ KLASÖR YOLU
    const imageUrl = req.file ? `/uploads/forum_images/${req.file.filename}` : null;

    try {
        await db.Reply.create({
            content,
            imageUrl,
            postId: postId,
            userId: req.session.user.id
        });
        req.flash('success_msg', 'Yanıtınız eklendi.');
        res.redirect( `/forum/${postId}`);
    } catch (error) {
        req.flash('error_msg', 'Yanıt eklenemedi.');
        res.redirect(`/forum/${postId}`);
    }
};