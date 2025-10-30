const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reply = sequelize.define('Reply', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    imageUrl: { // Cevapla birlikte yüklenen fotoğraf için
        type: DataTypes.STRING,
        allowNull: true
    }
    // userId ve postId alanları ilişkiyle eklenecek
}, {
    tableName: 'replies'
});

module.exports = Reply;
