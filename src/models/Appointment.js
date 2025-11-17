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
    // --- GÜNCELLENEN STATUS ---
    // 'available' kaldırıldı, 'busy' eklendi.
    status: {
        type: DataTypes.ENUM('busy', 'pending', 'confirmed', 'rejected'),
        allowNull: false
        // Varsayılan değer (defaultValue) kaldırıldı. Durum net olarak belirtilmeli.
    },
    // --- ---
    studentNotes: {
        type: DataTypes.TEXT, // Öğrencinin randevu isterken yazdığı not
        allowNull: true
    }
    // teacherId ve studentId ilişkilerle eklenecek
}, {
    tableName: 'appointments'
});

module.exports = Appointment;