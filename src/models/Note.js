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
        type: DataTypes.TEXT('long'),
        allowNull: false
    }
    // isPublic ARTIK YOK (Ders üzerinden kontrol edilecek)
    // imagePath ve filePath veritabanında kalsa da modelden siliyoruz, kafa karıştırmasın.
}, {
    tableName: 'notes'
});

module.exports = Note;