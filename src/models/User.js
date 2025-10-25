const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    // Model attributes are defined here
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // --- YENİ EKLENEN ALAN ---
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'user' // Varsayılan rol 'user'
    }
}, {
    // Diğer model seçenekleri
    tableName: 'users'
});

module.exports = User;