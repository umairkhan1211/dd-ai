'use strict';

const DEFAULT_AVATAR = '/api/cast/default-avatar';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async transaction => {
      // Add avatar column with default value (NOT NULL)
      await queryInterface.addColumn(
        'cast_members',
        'avatar',
        {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: DEFAULT_AVATAR,
        },
        { transaction }
      );

      // Update existing records to have the default avatar
      await queryInterface.sequelize.query(
        `UPDATE cast_members SET avatar = '${DEFAULT_AVATAR}' WHERE avatar IS NULL OR avatar = ''`,
        { transaction }
      );
    });
  },

  down: async queryInterface => {
    await queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.removeColumn('cast_members', 'avatar', { transaction });
    });
  },
};
