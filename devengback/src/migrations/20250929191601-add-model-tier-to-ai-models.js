'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First create the ENUM type
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_ai_models_model_tier" AS ENUM ('budget', 'standard', 'premium');
    `);

    // Add the column
    await queryInterface.addColumn('ai_models', 'model_tier', {
      type: Sequelize.ENUM('budget', 'standard', 'premium'),
      allowNull: false,
      defaultValue: 'standard',
    });

    // Add index for better performance
    await queryInterface.addIndex('ai_models', ['model_tier']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('ai_models', 'model_tier');
    await queryInterface.sequelize.query(`DROP TYPE "enum_ai_models_model_tier";`);
  },
};
