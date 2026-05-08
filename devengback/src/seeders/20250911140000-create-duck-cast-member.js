'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [existingDuck] = await queryInterface.sequelize.query(
      `SELECT id FROM cast_members WHERE name = 'Duck' LIMIT 1;`
    );

    if (existingDuck.length > 0) {
      console.log('🦆 Duck already exists. Skipping.');
      return;
    }

    // 👇 FETCH ADMIN USER ID DYNAMICALLY
    const [admins] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE role = 'admin' LIMIT 1;`
    );

    if (admins.length === 0) {
      throw new Error('❌ No admin user found. Please run create-system-admin seeder first.');
    }

    const adminUserId = admins[0].id;
    const duckId = uuidv4();

    await queryInterface.bulkInsert('cast_members', [
      {
        id: duckId,
        user_id: adminUserId,
        name: 'Duck',
        functional_role: 'Official Mascot & Platform Guide',
        description: 'Your go-to assistant for everything about this platform. Ask me anything!',
        default_tone: 'Friendly, helpful, clear',
        invocation_phrases: JSON.stringify(['Hey Duck', 'Hello Duck', 'Help me Duck']),
        priority: -100,
        avatar: 'https://yourdomain.com/public/defaults/duck-avatar.png', // 🚨 REPLACE
        is_system: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    console.log(' Duck created and assigned to admin user!');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('cast_members', { name: 'Duck' });
    console.log('🦆 Duck deleted.');
  },
};
