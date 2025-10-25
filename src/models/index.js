const { Sequelize } = require('sequelize'); // <-- YENİ EKLENEN SATIR
const sequelize = require('../config/database');
const Course = require('./course');
const Note = require('./note');
const User = require('./user');

// İlişkileri Tanımlama
// Bir Ders'in birden çok Not'u olabilir (One-to-Many)
Course.hasMany(Note, {
    foreignKey: 'courseId', // notes tablosuna eklenecek foreign key sütunu
    onDelete: 'CASCADE' // Eğer bir ders silinirse, o derse ait tüm notlar da silinsin
});

Note.belongsTo(Course, {
    foreignKey: 'courseId'
});

// Modelleri ve bağlantıyı bir obje olarak dışa aktar
const db = {
    sequelize,
    Sequelize, // Artık bu satır hata vermeyecek
    User,
    Course,
    Note
};

module.exports = db;