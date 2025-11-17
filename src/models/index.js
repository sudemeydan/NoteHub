const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

// --- TÜM MODELLERİ IMPORT ET ---
const Course = require('./Course');
const Note = require('./Note');
const User = require('./User');
const Post = require('./Post');
const Reply = require('./Reply');
const Assignment = require('./Assignment');
const Submission = require('./Submission');
const Appointment = require('./Appointment'); // <-- EKSİK OLAN BUYDU

// --- TÜM İLİŞKİLERİ TANIMLA ---

// 1. Ders ve Not
Course.hasMany(Note, { foreignKey: 'courseId', onDelete: 'CASCADE' });
Note.belongsTo(Course, { foreignKey: 'courseId' });

// 2. Forum (Arkadaşınızın)
User.hasMany(Post, { foreignKey: 'userId' });
Post.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Reply, { foreignKey: 'userId' });
Reply.belongsTo(User, { foreignKey: 'userId' });
Post.hasMany(Reply, { foreignKey: 'postId', onDelete: 'CASCADE' });
Reply.belongsTo(Post, { foreignKey: 'postId' });

// 3. Ödev ve Teslim
Assignment.hasMany(Submission, { foreignKey: 'assignmentId', onDelete: 'CASCADE' });
Submission.belongsTo(Assignment, { foreignKey: 'assignmentId' });
User.hasMany(Submission, { foreignKey: 'userId', onDelete: 'SET NULL' });
Submission.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Assignment, { foreignKey: 'teacherId' });
Assignment.belongsTo(User, { foreignKey: 'teacherId', as: 'Teacher' });

// --- 4. RANDEVU İLİŞKİLERİ (EKSİK OLAN KISIM) ---
User.hasMany(Appointment, {
    foreignKey: 'teacherId',
    as: 'TeacherAppointments'
});
Appointment.belongsTo(User, {
    foreignKey: 'teacherId',
    as: 'Teacher'
});
User.hasMany(Appointment, {
    foreignKey: 'studentId',
    as: 'StudentAppointments'
});
Appointment.belongsTo(User, {
    foreignKey: 'studentId',
    as: 'Student'
});
// --- İLİŞKİLER SONU ---

const db = {
    sequelize,
    Sequelize,
    User,
    Course,
    Note,
    Post,
    Reply,
    Assignment,
    Submission,
    Appointment // <-- EKSİK OLAN BUYDU
};

module.exports = db;