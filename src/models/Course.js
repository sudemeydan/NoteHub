const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Course = sequelize.define('Course', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // --- YENİ: Dersin Görünürlüğü ---
    isPublic: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true // Varsayılan: Herkese Açık
    }
}, {
    tableName: 'courses'
});

module.exports = Course;