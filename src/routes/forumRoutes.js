const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');
const upload = require('../middlewares/uploadMiddleware'); // Fotoğraf yükleme middleware'i




router.get('/forum',forumController.getForumPage)
// GET /forum/yeni - Yeni konu açma sayfası
router.get('/yeni', forumController.getNewPostPage);

// POST /forum/yeni - Yeni konu oluşturma (fotoğraf yüklemeli)
router.post('/yeni', upload, forumController.createNewPost);

// GET /forum/:id - Konu detay sayfası
router.get('/:id', forumController.getPostDetailPage);

// POST /forum/:id/reply - Konuya yanıt verme (fotoğraf yüklemeli)
router.post('/:id/reply', upload, forumController.createNewReply);

router.get('/', forumController.getForumPage);

module.exports = router;