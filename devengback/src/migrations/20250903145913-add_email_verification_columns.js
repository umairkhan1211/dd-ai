'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async transaction => {
      // Add is_verified column
      await queryInterface.addColumn(
        'users',
        'is_verified',
        {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          after: 'is_first_login',
        },
        { transaction }
      );

      // Add verification_token column
      await queryInterface.addColumn(
        'users',
        'verification_token',
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'is_verified',
        },
        { transaction }
      );

      // Mark existing users as verified
      await queryInterface.sequelize.query('UPDATE users SET is_verified = true', { transaction });
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.removeColumn('users', 'is_verified', { transaction });
      await queryInterface.removeColumn('users', 'verification_token', { transaction });
    });
  },
};
