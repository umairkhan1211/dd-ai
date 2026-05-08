'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Define ENUM type first for PostgreSQL
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_messages_role" AS ENUM('user', 'assistant', 'system');
    `);

    await queryInterface.createTable('messages', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      session_id: {
        // Underscored name for sessionId
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'chat_sessions', // Assumes 'chat_sessions' table already exists
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // Delete messages if the associated chat session is deleted
      },
      role: {
        type: 'enum_messages_role', // Use the custom ENUM type
        allowNull: false,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      token_count: {
        // Underscored name for tokenCount
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false, // Assuming it's not nullable given defaultValue
      },
      raw_content: {
        // Underscored name for rawContent
        type: Sequelize.JSONB, // Use Sequelize.JSON for MySQL/SQLite
        allowNull: true,
      },
      created_at: {
        // Only createdAt as updatedAt is false in model
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      // Note: 'updated_at' is intentionally omitted here as `updatedAt: false` is set in the model
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('messages');
    // Drop the ENUM type only after dropping the table that uses it
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_messages_role";');
  },
};
