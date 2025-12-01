'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Şifre sıfırlama tokenı
    await queryInterface.addColumn('users', 'resetPasswordToken', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // Tokenın geçerlilik süresi (Örn: 1 saat sonra geçersiz olsun)
    await queryInterface.addColumn('users', 'resetPasswordExpires', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'resetPasswordExpires');
    await queryInterface.removeColumn('users', 'resetPasswordToken');
  }
};