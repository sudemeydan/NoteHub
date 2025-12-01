const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Availability = sequelize.define('Availability', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    dayOfWeek: {
        type: DataTypes.INTEGER, // 0=Pazar, 1=Pazartesi... JS getDay() formatı
        allowNull: false,
        validate: {
            min: 0,
            max: 6
        }
    },
    startTime: {
        type: DataTypes.TIME,
        allowNull: false
    },
    endTime: {
        type: DataTypes.TIME,
        allowNull: false
    }
    // teacherId ilişkiden gelecek
}, {
    tableName: 'availabilities'
});

module.exports = Availability;