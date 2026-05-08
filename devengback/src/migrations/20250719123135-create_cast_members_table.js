'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('cast_members', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        // Matches 'field: user_id' from model
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users', // Assumes 'users' table already exists
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // Delete cast members if the user is deleted
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      functional_role: {
        // Renamed from 'role', matches 'field: functional_role'
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT, // Using TEXT for potentially longer descriptions
        allowNull: true, // Now optional
      },
      default_tone: {
        // Renamed from 'tone', matches 'field: default_tone'
        type: Sequelize.STRING,
        allowNull: false,
      },
      invocation_phrases: {
        // New field
        type: Sequelize.JSONB, // Use Sequelize.JSON for MySQL/SQLite
        allowNull: false,
        defaultValue: [], // Matches model's defaultValue
      },
      priority: {
        // New field
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0, // Matches model's defaultValue
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

    // Add unique index after table creation, as defined in the model
    await queryInterface.addConstraint('cast_members', {
      fields: ['user_id', 'name'],
      type: 'unique',
      name: 'cast_members_user_id_name_unique',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the unique constraint first
    await queryInterface.removeConstraint('cast_members', 'cast_members_user_id_name_unique');
    await queryInterface.dropTable('cast_members');
  },
};
