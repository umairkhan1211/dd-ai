'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Define ENUM types first for PostgreSQL
    // Ensure these names match the ENUMs in UserSubscription.model.ts
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_user_subscriptions_status" AS ENUM(
        'active', 'trialing', 'past_due', 'canceled', 'unpaid', 'paused', 'incomplete', 'expired'
      );
    `);
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_user_subscriptions_tier" AS ENUM(
        'free', 'core', 'pro'
      );
    `);

    await queryInterface.createTable('user_subscriptions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true, // One subscription record per user
        references: {
          model: 'users', // Reference the 'users' table
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      stripe_customer_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      stripe_subscription_id: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      stripe_price_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: 'enum_user_subscriptions_status', // Use the custom ENUM type
        allowNull: true,
      },
      tier: {
        type: 'enum_user_subscriptions_tier', // Use the custom ENUM type
        defaultValue: 'free',
        allowNull: false,
      },
      current_period_start: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      current_period_end: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      cancel_at_period_end: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
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
    await queryInterface.dropTable('user_subscriptions');
    // Drop the ENUM types only after dropping the table that uses them
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_user_subscriptions_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_user_subscriptions_tier";');
  },
};
