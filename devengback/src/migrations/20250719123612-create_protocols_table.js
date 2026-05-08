'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Define ENUM type first for PostgreSQL for 'type' field
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_protocols_type" AS ENUM('static', 'semi-dynamic', 'compositional');
    `);

    await queryInterface.createTable('protocols', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        // Underscored name for userId
        type: Sequelize.UUID,
        allowNull: true, // userId is optional/nullable in model
        references: {
          model: 'users', // Assumes 'users' table already exists
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // If user is deleted, set userId to NULL
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      level: {
        type: Sequelize.INTEGER,
        allowNull: false,
        // The `validate: { isIn: [[1, 2, 3]] }` is a model-level validation,
        // not a database-level constraint. If you need a DB constraint,
        // consider CHECK constraint if supported by your DB.
      },
      type: {
        type: 'enum_protocols_type', // Use the custom ENUM type
        allowNull: false,
      },
      prompt_template: {
        // Underscored name for promptTemplate
        type: Sequelize.TEXT,
        allowNull: false,
      },
      inputs: {
        type: Sequelize.JSONB, // Use Sequelize.JSON for MySQL/SQLite
        allowNull: true,
      },
      modifiers: {
        type: Sequelize.JSONB, // Use Sequelize.JSON for MySQL/SQLite
        allowNull: true,
      },
      logic: {
        type: Sequelize.JSONB, // Use Sequelize.JSON for MySQL/SQLite
        allowNull: true,
      },
      delivered_by: {
        // Underscored name for deliveredBy
        type: Sequelize.STRING,
        allowNull: true,
      },
      category: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'General',
      },
      is_active: {
        // Underscored name for isActive
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

    // Add unique index after table creation, as defined in the model
    await queryInterface.addConstraint('protocols', {
      fields: ['user_id', 'name'],
      type: 'unique',
      name: 'protocols_user_id_name_unique',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the unique constraint first
    await queryInterface.removeConstraint('protocols', 'protocols_user_id_name_unique');
    await queryInterface.dropTable('protocols');
    // Drop the ENUM type only after dropping the table that uses it
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_protocols_type";');
  },
};
