'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      google_id: {
        // Matches 'field: google_id' from model
        type: Sequelize.STRING,
        allowNull: true, // As per latest model
        unique: true,
      },
      display_name: {
        // Matches 'field: display_name' from model
        type: Sequelize.STRING,
        allowNull: false,
      },
      first_name: {
        // Matches 'field: first_name' from model
        type: Sequelize.STRING,
        allowNull: true,
      },
      last_name: {
        // Matches 'field: last_name' from model
        type: Sequelize.STRING,
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      password: {
        // Added as per latest model
        type: Sequelize.STRING,
        allowNull: true,
      },
      image: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      active_operator: {
        // Added as per latest model
        type: Sequelize.UUID,
        allowNull: true,
        // If 'activeOperator' is a foreign key to 'users.id', define reference here:
        // references: {
        //   model: 'users', // The table name activeOperator refers to
        //   key: 'id',
        // },
        // onUpdate: 'CASCADE',
        // onDelete: 'SET NULL', // Or 'CASCADE' if appropriate
      },
      created_at: {
        // Matches 'timestamps: true' and 'underscored: true'
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        // Matches 'timestamps: true' and 'underscored: true'
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  },
};
