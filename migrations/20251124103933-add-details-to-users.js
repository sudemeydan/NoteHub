'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Email sütunu ekle
    await queryInterface.addColumn('users', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      defaultValue: 'test@example.com', // Mevcut kayıtlar patlamasın diye geçici varsayılan
      after: 'username'
    });

    // Telefon Numarası sütunu ekle
    await queryInterface.addColumn('users', 'phoneNumber', {
      type: Sequelize.STRING,
      allowNull: true, // Zorunlu olmasın (opsiyonel)
      after: 'email'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'phoneNumber');
    await queryInterface.removeColumn('users', 'email');
  }
};