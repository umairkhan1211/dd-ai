'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First add the avatar column to existing chat_sessions table
    await queryInterface.addColumn('chat_sessions', 'avatar', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('chat_sessions', 'avatar');
  },
};
