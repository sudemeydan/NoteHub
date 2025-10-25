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
        type: DataTypes.TEXT('long'), // Çok uzun metinler için LONGTEXT
        allowNull: false
    }
    // course_id alanı ilişkiler kurulurken otomatik eklenecek
}, {
    tableName: 'notes'
});

module.exports = Note;