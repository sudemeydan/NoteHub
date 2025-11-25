'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // 1. Notes tablosundan 'isPublic' sütununu kaldır
    await queryInterface.removeColumn('notes', 'isPublic');

    // 2. Courses tablosuna 'isPublic' sütununu ekle
    await queryInterface.addColumn('courses', 'isPublic', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true, // Varsayılan: Herkese Açık
      after: 'description'
    });
  },

  async down (queryInterface, Sequelize) {
    // Geri alma işlemleri
    await queryInterface.removeColumn('courses', 'isPublic');
    await queryInterface.addColumn('notes', 'isPublic', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });
  }
};