'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // !!! BU SATIRLARI YORUM SATIRI YAPTIK !!!
    // Çünkü 'force: true' komutu bu sütunları zaten oluşturdu.
    
    /*
    // Email sütunu ekle
    await queryInterface.addColumn('users', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      defaultValue: 'test@example.com', 
      after: 'username'
    });

    // Telefon Numarası sütunu ekle
    await queryInterface.addColumn('users', 'phoneNumber', {
      type: Sequelize.STRING,
      allowNull: true, 
      after: 'email'
    });
    */
  },

  async down (queryInterface, Sequelize) {
    // Burası kalabilir
    await queryInterface.removeColumn('users', 'phoneNumber');
    await queryInterface.removeColumn('users', 'email');
  }
};