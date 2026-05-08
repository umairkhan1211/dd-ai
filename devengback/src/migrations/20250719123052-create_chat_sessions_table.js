'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('chat_sessions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        // Underscored name for userId
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users', // Assumes 'users' table already exists
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // Delete chat sessions if the user is deleted
      },
      title: {
        type: Sequelize.STRING,
        allowNull: true, // Matches model's optional title
      },
      meta: {
        type: Sequelize.JSONB, // Use Sequelize.JSON for MySQL/SQLite
        allowNull: true, // Matches model's optional meta
      },
      parent_id: {
        // Underscored name for parentId
        type: Sequelize.UUID,
        allowNull: true, // Matches model's optional parentId
        references: {
          model: 'chat_sessions', // Self-referencing table
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // If parent session is deleted, set parent_id to NULL
      },
      root_id: {
        // Underscored name for rootId
        type: Sequelize.UUID,
        allowNull: true, // Matches model's optional rootId
        references: {
          model: 'chat_sessions', // Self-referencing table
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // If root session is deleted, set root_id to NULL
      },
      created_at: {
        // Automatically managed by Sequelize if timestamps: true
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        // Automatically managed by Sequelize if timestamps: true
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('chat_sessions');
  },
};
