module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('users', {
      fields: ['email'],
      type: 'unique',
      name: 'unique_users_email', // explicit name for better tracking
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('users', 'unique_users_email');
  },
};
