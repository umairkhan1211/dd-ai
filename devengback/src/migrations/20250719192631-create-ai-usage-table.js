'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ai_usage', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users', // Assumes your users table is named 'users'
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      session_id: {
        type: Sequelize.UUID,
        allowNull: true,
        // Optional: Uncomment and adjust if you have a 'sessions' table and want a foreign key
        // references: { model: 'sessions', key: 'id' },
        // onUpdate: 'CASCADE',
        // onDelete: 'SET NULL',
      },
      interaction_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      model_used: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      input_tokens: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      output_tokens: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      estimated_ducks: {
        type: Sequelize.FLOAT, // Use FLOAT for potential fractional duck costs
        allowNull: false,
        defaultValue: 0.0,
      },
      actual_ducks: {
        type: Sequelize.FLOAT, // Use FLOAT for potential fractional duck costs
        allowNull: false,
        defaultValue: 0.0,
      },
      status: {
        type: Sequelize.ENUM('pending', 'completed', 'failed', 'refunded'),
        allowNull: false,
        defaultValue: 'pending',
      },
      ai_response_id: {
        type: Sequelize.STRING,
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

    // Add indexes for frequently queried columns to improve performance
    await queryInterface.addIndex('ai_usage', ['user_id'], {
      name: 'idx_ai_usage_user_id',
    });
    await queryInterface.addIndex('ai_usage', ['session_id'], {
      name: 'idx_ai_usage_session_id',
    });
    await queryInterface.addIndex('ai_usage', ['interaction_type'], {
      name: 'idx_ai_usage_interaction_type',
    });
    await queryInterface.addIndex('ai_usage', ['user_id', 'created_at'], {
      name: 'idx_ai_usage_user_id_created_at',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ai_usage');
  },
};
