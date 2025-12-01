const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Appointment = sequelize.define('Appointment', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    startTime: {
        type: DataTypes.DATE, 
        allowNull: false
    },
    endTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('busy', 'pending', 'confirmed', 'rejected'),
        allowNull: false
    },
    studentNotes: {
        type: DataTypes.TEXT, // Öğrencinin randevu isterken yazdığı not
        allowNull: true
    },
    // --- YENİ EKLENEN ALAN ---
    meetingLink: {
        type: DataTypes.STRING, // Zoom/Meet linki
        allowNull: true
    }
    // -------------------------
    // teacherId ve studentId ilişkilerle eklenecek
}, {
    tableName: 'appointments'
});

module.exports = Appointment;