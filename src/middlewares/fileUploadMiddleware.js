const multer = require('multer');
const path = require('path');

// Hocanın ödev dosyaları için (PDF, ZIP, DOCX vb.)
const assignmentStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/assignments/'); // Dosyaları buraya kaydet
    },
    filename: (req, file, cb) => {
        // Dosya adını benzersiz yap: timestamp-orijinal_ad
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

// Hangi dosya türlerine izin verileceği
const assignmentFileFilter = (req, file, cb) => {
    // İzin verilen dosya türleri
    const allowedTypes = /pdf|zip|msword|vnd.openxmlformats-officedocument.wordprocessingml.document|jpeg|jpg|png|txt/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb('Hata: Sadece PDF, ZIP, DOC, DOCX, TXT veya Resim dosyaları yükleyebilirsiniz!');
};

// Middleware'i yapılandır
exports.uploadAssignmentFile = multer({
    storage: assignmentStorage,
    limits: { fileSize: 1024 * 1024 * 20 }, // 20MB limit
    fileFilter: assignmentFileFilter
}).single('assignmentFile'); // Formdaki input'un adı 'assignmentFile' olacak
// ... (dosyanın üstündeki uploadAssignmentFile kodu aynı kalıyor) ...

// Öğrencinin teslim (submission) dosyaları için (PDF, ZIP, Resim vb.)
const submissionStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/submissions/'); // Dosyaları buraya kaydet
    },
    filename: (req, file, cb) => {
        // Dosya adını benzersiz yap: ogrenciID-odevID-tarih-orijinal_ad
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Güvenlik için kullanıcı ID'sini de ekleyebiliriz (req.session.user.id)
        cb(null, `${req.session.user.id}-${req.body.assignmentId}-${uniqueSuffix}-${file.originalname}`);
    }
});

// Hangi dosya türlerine izin verileceği (assignment ile aynı)
const submissionFileFilter = (req, file, cb) => {
    const allowedTypes = /pdf|zip|msword|vnd.openxmlformats-officedocument.wordprocessingml.document|jpeg|jpg|png|txt/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb('Hata: Sadece PDF, ZIP, DOC, DOCX, TXT veya Resim dosyaları yükleyebilirsiniz!');
};

// Yeni middleware'i export et
exports.uploadSubmissionFile = multer({
    storage: submissionStorage,
    limits: { fileSize: 1024 * 1024 * 20 }, // 20MB limit
    fileFilter: submissionFileFilter
}).single('submissionFile'); // Formdaki input'un adı 'submissionFile' olacak