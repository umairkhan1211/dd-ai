'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Change total_ducks_available to DECIMAL(10,2)
    await queryInterface.changeColumn('user_wallets', 'total_ducks_available', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    });

    // Change daily_duck_bonus_remaining to DECIMAL(10,2) (to match model)
    await queryInterface.changeColumn('user_wallets', 'daily_duck_bonus_remaining', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    });

    // Change monthly_duck_quota to DECIMAL(10,2) (to match model)
    await queryInterface.changeColumn('user_wallets', 'monthly_duck_quota', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    });

    // Change rollover_ducks to DECIMAL(10,2) (to match model)
    await queryInterface.changeColumn('user_wallets', 'rollover_ducks', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert to FLOAT if needed
    await queryInterface.changeColumn('user_wallets', 'total_ducks_available', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.changeColumn('user_wallets', 'daily_duck_bonus_remaining', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.changeColumn('user_wallets', 'monthly_duck_quota', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.changeColumn('user_wallets', 'rollover_ducks', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0,
    });
  },
};
