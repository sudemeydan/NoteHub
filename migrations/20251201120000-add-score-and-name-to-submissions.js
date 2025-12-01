'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // 1. Puanlama için 'score' sütunu ekle
    await queryInterface.addColumn('submissions', 'score', {
      type: Sequelize.INTEGER,
      allowNull: true, // Puan verilmemiş olabilir
      defaultValue: null
    });

    // 2. Teslim anındaki Ad Soyad beyanı için 'studentName' sütunu ekle
    await queryInterface.addColumn('submissions', 'studentName', {
      type: Sequelize.STRING,
      allowNull: true // Eski kayıtlar için null olabilir ama kodla zorunlu tutacağız
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('submissions', 'studentName');
    await queryInterface.removeColumn('submissions', 'score');
  }
};