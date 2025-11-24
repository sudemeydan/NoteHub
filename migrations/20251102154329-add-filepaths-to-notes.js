'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    // imagePath sütununu ekle (görsel için)
   /* await queryInterface.addColumn('notes', 'imagePath', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'content'
    });
    // filePath sütununu ekle (PDF/ZIP gibi dosyalar için)
    await queryInterface.addColumn('notes', 'filePath', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'imagePath'
    });*/
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('notes', 'filePath');
    await queryInterface.removeColumn('notes', 'imagePath');
  }
};