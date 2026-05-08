'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add ai_model_id column to cast_members table
    await queryInterface.addColumn('cast_members', 'ai_model_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'ai_models',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // Add ai_model_id column to protocols table
    await queryInterface.addColumn('protocols', 'ai_model_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'ai_models',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // Add indexes for better performance on foreign key lookups
    await queryInterface.addIndex('cast_members', ['ai_model_id']);
    await queryInterface.addIndex('protocols', ['ai_model_id']);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes first
    await queryInterface.removeIndex('cast_members', ['ai_model_id']);
    await queryInterface.removeIndex('protocols', ['ai_model_id']);

    // Remove columns
    await queryInterface.removeColumn('cast_members', 'ai_model_id');
    await queryInterface.removeColumn('protocols', 'ai_model_id');
  },
};
