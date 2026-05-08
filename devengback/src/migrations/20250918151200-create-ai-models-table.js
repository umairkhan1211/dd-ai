'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ai_models', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      display_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      provider: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      model_type: {
        type: Sequelize.ENUM('text', 'image', 'code', 'multimodal'),
        allowNull: false,
        defaultValue: 'text',
      },
      max_tokens: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      input_cost_per_token: {
        type: Sequelize.DECIMAL(10, 6),
        allowNull: false,
        defaultValue: 0,
      },
      output_cost_per_token: {
        type: Sequelize.DECIMAL(10, 6),
        allowNull: false,
        defaultValue: 0,
      },
      duck_cost_multiplier: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: false,
        defaultValue: 1.0,
      },
      capabilities: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      tier_access: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: ['trial', 'core', 'pro'],
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes for better performance
    await queryInterface.addIndex('ai_models', ['name']);
    await queryInterface.addIndex('ai_models', ['provider']);
    await queryInterface.addIndex('ai_models', ['is_active']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ai_models');
  },
};
