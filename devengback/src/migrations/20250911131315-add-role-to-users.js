'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add column with NOT NULL + DEFAULT 'user'
    await queryInterface.addColumn('users', 'role', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'user',
    });

    // Optional: Add index if you query by role often
    // await queryInterface.addIndex('users', ['role'], { name: 'users_role_idx' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'role');
  },
};
