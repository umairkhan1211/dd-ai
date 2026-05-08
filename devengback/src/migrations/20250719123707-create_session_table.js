'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('session', {
      sid: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
      },
      sess: {
        type: Sequelize.JSON, // Use Sequelize.JSONB for PostgreSQL if needed, otherwise Sequelize.JSON
        allowNull: false,
      },
      expire: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      // Note: `created_at` and `updated_at` are intentionally omitted
      // because `timestamps: false` is set in your model definition.
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('session');
  },
};
