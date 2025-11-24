'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    /*await queryInterface.addColumn('users', 'role', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'user', // Veritabanı seviyesinde de varsayılan değer
      after: 'password' // 'password' sütunundan sonra gelsin
    });*/
    // Mevcut admin kullanıcısının rolünü 'admin' yapalım (Eğer varsa)
    //await queryInterface.sequelize.query(`UPDATE users SET role = 'admin' WHERE username = 'admin'`);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'role');
  }
};