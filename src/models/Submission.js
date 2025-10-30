const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Submission = sequelize.define('Submission', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    textSubmission: {
        type: DataTypes.TEXT, // Öğrenci metin olarak cevap verirse
        allowNull: true
    },
    filePath: {
        type: DataTypes.STRING, // Öğrencinin yüklediği PDF/ZIP/Resim dosyasının yolu
        allowNull: true
    }
    // Hangi ödeve ait olduğu (assignmentId) ve hangi öğrenciye ait olduğu (userId)
    // ilişkilerde (relationships) otomatik olarak eklenecek.
}, {
    tableName: 'submissions'
});

module.exports = Submission;