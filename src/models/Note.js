const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Note = sequelize.define('Note', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT('long'), // Burası artık Markdown metni saklayacak
        allowNull: false
    },
    // --- YENİ SÜTUNLAR ---
    imagePath: {
        type: DataTypes.STRING, // Notun kapak/ana resmi
        allowNull: true
    },
    filePath: {
        type: DataTypes.STRING, // Notla ilgili PDF, ZIP vb. dosya
        allowNull: true
    }
    // course_id alanı ilişkilerde
}, {
    tableName: 'notes'
});

module.exports = Note;