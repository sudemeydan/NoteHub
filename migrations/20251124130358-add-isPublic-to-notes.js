'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('notes', 'isPublic', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true, // Varsayılan olarak herkese açık olsun
      after: 'content'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('notes', 'isPublic');
  }
};