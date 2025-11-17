const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');
// Düzeltildi: Birleşik middleware dosyasından import et
const { uploadForumImage } = require('../middlewares/fileUploadMiddleware'); 

// GET /forum/ -> Forum ana sayfası
router.get('/', forumController.getForumPage);

// GET /forum/yeni -> Yeni konu açma sayfası
router.get('/yeni', forumController.getNewPostPage);

// POST /forum/yeni -> Yeni konu oluşturma
router.post('/yeni', uploadForumImage, forumController.createNewPost);

// GET /forum/:id -> Konu detay sayfası
router.get('/:id', forumController.getPostDetailPage);

// POST /forum/:id/reply -> Konuya yanıt verme
router.post('/:id/reply', uploadForumImage, forumController.createNewReply);

// Hatalı olan /forum rotası kaldırıldı, / zaten o işi görüyor.

module.exports = router;