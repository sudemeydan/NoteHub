const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

// Tüm modelleri import et
const Course = require('./Course');
const Note = require('./Note');
const User = require('./User');
const Assignment = require('./Assignment');   // <-- YENİ
const Submission = require('./Submission'); // <-- YENİ
const Post = require('./Post');
const Reply = require('./Reply');


// --- Model İlişkileri ---

// 1. Ders ve Not İlişkisi (Zaten vardı)
Course.hasMany(Note, {
    foreignKey: 'courseId',
    onDelete: 'CASCADE' // Eğer bir ders silinirse, o derse ait tüm notlar da silinsin
});
Note.belongsTo(Course, {
    foreignKey: 'courseId'
});


// --- YENİ İLİŞKİLER ---

// 2. Ödev ve Teslim İlişkisi
// Bir Ödev'in (Assignment) birden çok Teslim'i (Submission) olabilir
Assignment.hasMany(Submission, {
    foreignKey: 'assignmentId',
    onDelete: 'CASCADE' // Ödev silinirse, teslimler de silinsin
});
Submission.belongsTo(Assignment, {
    foreignKey: 'assignmentId'
});

// 3. Kullanıcı ve Teslim İlişkisi
// Bir Kullanıcı (Öğrenci) birden çok Teslim (Submission) yapabilir
User.hasMany(Submission, {
    foreignKey: 'userId',
    onDelete: 'SET NULL' // Kullanıcı hesabını silerse, teslimi kalsın ama sahibi "null" olsun
});
Submission.belongsTo(User, {
    foreignKey: 'userId'
});

// 4. (İsteğe bağlı) Hoca ve Ödev İlişkisi
// Bir Kullanıcı (Hoca/Admin) birden çok Ödev (Assignment) oluşturabilir
// 'admin' rolündeki kullanıcıların ödevlerini ayırmak için bu ilişki eklenebilir.
User.hasMany(Assignment, { 
    foreignKey: 'teacherId' // assignments tablosuna 'teacherId' sütunu ekler
});
Assignment.belongsTo(User, { 
    foreignKey: 'teacherId',
    as: 'Teacher' // İlişkiye isim verme (opsiyonel)
});
// Bir Kullanıcı birden çok Post (Konu) açabilir
User.hasMany(Post, { foreignKey: 'userId' });
Post.belongsTo(User, { foreignKey: 'userId' });

// Bir Kullanıcı birden çok Reply (Yanıt) yazabilir
User.hasMany(Reply, { foreignKey: 'userId' });
Reply.belongsTo(User, { foreignKey: 'userId' });

// Bir Post (Konu) birden çok Reply (Yanıt) alabilir
Post.hasMany(Reply, { 
    foreignKey: 'postId',
    onDelete: 'CASCADE' // Ana konu silinirse tüm yanıtlar da silinir
});
Reply.belongsTo(Post, { foreignKey: 'postId' });


// --- Veritabanı Objesini Dışa Aktar ---
const db = {
    sequelize,
    Sequelize,
    User,
    Post,
    Reply,
    Course,
    Note,
    Assignment, // <-- YENİ
    Submission  // <-- YENİ
};

module.exports = db;