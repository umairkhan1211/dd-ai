'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_wallets', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true, // One wallet record per user
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      total_ducks_available: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
        allowNull: false,
      },
      monthly_duck_quota: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      daily_duck_bonus_remaining: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      last_daily_bonus_reset: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      rollover_ducks: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      last_monthly_reset: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      cast_members_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      protocols_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      one_time_duck_grant_given: {
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
    await queryInterface.dropTable('user_wallets');
  },
};
