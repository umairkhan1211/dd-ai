'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Define ENUM type for transaction type
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_duck_transactions_type" AS ENUM(
        'allocation', 'deduction', 'bonus', 'grant', 'rollover', 'adjustment'
      );
    `);

    await queryInterface.createTable('duck_transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      type: {
        type: 'enum_duck_transactions_type', // Use the custom ENUM type
        allowNull: false,
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      balance_after: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      details: {
        type: Sequelize.JSONB, // Use JSON for MySQL/SQLite if not PostgreSQL
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
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('duck_transactions');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_duck_transactions_type";');
  },
};
