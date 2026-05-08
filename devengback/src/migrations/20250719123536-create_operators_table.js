'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('operators', {
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
        onDelete: 'CASCADE', // Delete operators if the associated user is deleted
      },
      label: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      profile: {
        type: Sequelize.JSONB, // Use Sequelize.JSON for MySQL/SQLite
        allowNull: false,
      },
      created_at: {
        // Automatically managed by Sequelize as timestamps: true is default
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        // Automatically managed by Sequelize as timestamps: true is default
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('operators');
  },
};
