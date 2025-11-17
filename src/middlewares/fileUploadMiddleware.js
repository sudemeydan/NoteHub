const multer = require('multer');
const path = require('path');

// --- 1. ÖDEV DOSYALARI (Hoca) ---
const assignmentStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/assignments/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const assignmentFileFilter = (req, file, cb) => {
    const allowedTypes = /pdf|zip|msword|vnd.openxmlformats-officedocument.wordprocessingml.document|jpeg|jpg|png|txt/;
    if (allowedTypes.test(file.mimetype) || allowedTypes.test(path.extname(file.originalname).toLowerCase())) {
        return cb(null, true);
    }
    cb('Hata: İzin verilmeyen dosya türü (PDF, ZIP, DOC, TXT, Resim)!');
};
exports.uploadAssignmentFile = multer({
    storage: assignmentStorage,
    limits: { fileSize: 1024 * 1024 * 20 },
    fileFilter: assignmentFileFilter
}).single('assignmentFile');

// --- 2. TESLİM DOSYALARI (Öğrenci) ---
const submissionStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/submissions/');
    },
    filename: (req, file, cb) => {
        const userId = req.session && req.session.user ? req.session.user.id : 'unknown';
        const assignmentId = req.body.assignmentId || 'unknown';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${userId}-${assignmentId}-${uniqueSuffix}-${file.originalname}`);
    }
});
exports.uploadSubmissionFile = multer({
    storage: submissionStorage,
    limits: { fileSize: 1024 * 1024 * 20 },
    fileFilter: assignmentFileFilter
}).single('submissionFile');

// --- 3. NOT RESİMLERİ (TinyMCE) ---
const noteImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/note_images/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const noteImageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Sadece resim dosyaları yüklenebilir!'), false);
    }
};
exports.uploadTinyMCEImage = multer({
    storage: noteImageStorage,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
    fileFilter: noteImageFileFilter
}).single('file'); 

// --- 4. FORUM RESİMLERİ ---
const forumImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/forum_images/');
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});
exports.uploadForumImage = multer({
    storage: forumImageStorage,
    fileFilter: noteImageFileFilter, // Sadece resim
    limits: { fileSize: 1024 * 1024 * 5 } // 5MB
}).single('image'); // Forum formu 'image' adıyla gönderiyor