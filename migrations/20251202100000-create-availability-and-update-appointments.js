'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Availability Tablosunu Oluştur
    await queryInterface.createTable('availabilities', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      teacherId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      dayOfWeek: {
        type: Sequelize.INTEGER, // 0: Pazar, 1: Pazartesi, ... 6: Cumartesi
        allowNull: false
      },
      startTime: {
        type: Sequelize.TIME, // Sadece saat bilgisi (Örn: 09:00:00)
        allowNull: false
      },
      endTime: {
        type: Sequelize.TIME, // Sadece saat bilgisi (Örn: 12:00:00)
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 2. Appointments Tablosuna 'meetingLink' Ekle
    await queryInterface.addColumn('appointments', 'meetingLink', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('appointments', 'meetingLink');
    await queryInterface.dropTable('availabilities');
  }
};