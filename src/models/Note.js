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
    },
    // --- YENİ SÜTUN ---
    isPublic: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    // ------------------
    // (TinyMCE kullandığımız için imagePath/filePath'i modelden sildik/temizledik)
}, {
    tableName: 'notes'
});

module.exports = Note;