'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('files', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      message_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: false, // multiple file records per message
        references: {
          model: 'messages',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      original_name: {
        type: Sequelize.STRING,
        allowNull: false, // Matches model's optional title
      },
      unique_name: {
        type: Sequelize.STRING,
        allowNull: false, // Matches model's optional title
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
    await queryInterface.dropTable('files');
  },
};
