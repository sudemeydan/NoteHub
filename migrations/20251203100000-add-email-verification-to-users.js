'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Hesabın doğrulanıp doğrulanmadığını tutar
    await queryInterface.addColumn('users', 'isVerified', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false // Varsayılan olarak doğrulanmamış
    });

    // Doğrulama linki için token
    await queryInterface.addColumn('users', 'emailVerificationToken', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'emailVerificationToken');
    await queryInterface.removeColumn('users', 'isVerified');
  }
};