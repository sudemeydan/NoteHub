const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Post = sequelize.define('Post', {
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
        type: DataTypes.TEXT,
        allowNull: false
    },
    imageUrl: { // Konuyla birlikte yüklenen fotoğraf için
        type: DataTypes.STRING,
        allowNull: true
    }
    // userId alanı ilişkiyle eklenecek
}, {
    tableName: 'posts'
});

module.exports = Post;
