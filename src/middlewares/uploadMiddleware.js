const multer = require('multer');
const path = require('path');

// Yüklenen dosyaların nereye ve nasıl kaydedileceğini belirle
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // !!! DEĞİŞİKLİK BURADA !!!
        // Hedefi projenin ana dizinindeki 'uploads/forum' olarak ayarla
        cb(null, path.join(__dirname, '..', '..', 'uploads', 'forum'));
    },
    filename: (req, file, cb) => {
        // Dosya adını benzersiz yap (Tarih + Orijinal Ad)
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

// Sadece resim dosyalarına izin ver
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Sadece resim dosyaları yüklenebilir!'), false);
    }
};

const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } // 5MB limit
});

// 'image' adıyla gelen tek bir dosyayı işle
module.exports = upload.single('image');
