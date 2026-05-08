'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_sessions', {
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
        onDelete: 'CASCADE', // Delete user sessions if the associated user is deleted
      },
      session_id: {
        // Underscored name for sessionId
        type: Sequelize.STRING,
        allowNull: false,
        unique: true, // Ensuring sessionId is unique
      },
      started_at: {
        // Underscored name for startedAt
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), // Equivalent to DataTypes.NOW
      },
      last_activity: {
        // Underscored name for lastActivity
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), // Equivalent to DataTypes.NOW
      },
      ip_address: {
        // Underscored name for ipAddress
        type: Sequelize.STRING,
        allowNull: false,
      },
      user_agent: {
        // Underscored name for userAgent
        type: Sequelize.STRING,
        allowNull: false,
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        // Automatically managed by Sequelize as timestamps: true is default and underscored is true
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        // Automatically managed by Sequelize as timestamps: true is default and underscored is true
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_sessions');
  },
};
