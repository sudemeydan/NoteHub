
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Assignment = sequelize.define('Assignment', {
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
        type: DataTypes.TEXT, // Ödev açıklaması için
        allowNull: true
    },
    filePath: {
        type: DataTypes.STRING, // Hocanın yüklediği PDF/ZIP dosyasının yolu
        allowNull: true
    },
    dueDate: {
        type: DataTypes.DATE, // Son teslim tarihi (isteğe bağlı)
        allowNull: true
    }
}, {
    tableName: 'assignments'
});

module.exports = Assignment;