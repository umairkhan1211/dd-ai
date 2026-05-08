'use strict';

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt'); // 👈 Add bcrypt

const SALT_ROUNDS = 10; // 👈 Match your AuthService

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [existingAdmins] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE role = 'admin' LIMIT 1;`
    );

    if (existingAdmins.length > 0) {
      console.log('👑 Admin user already exists. Skipping creation.');
      return;
    }

    // 👇 SET YOUR PLAIN-TEXT PASSWORD HERE (change this!)
    const PLAIN_TEXT_PASSWORD = 'asdasd'; // 🚨 REPLACE IN PRODUCTION

    // 👇 Hash it with bcrypt
    const hashedPassword = await bcrypt.hash(PLAIN_TEXT_PASSWORD, SALT_ROUNDS);

    const adminUserId = uuidv4();

    await queryInterface.bulkInsert('users', [
      {
        id: adminUserId,
        email: 'admin@gmail.com',
        display_name: 'System Administrator',
        first_name: 'System',
        last_name: 'Admin',
        password: hashedPassword, // 👈 SAVED HASHED PASSWORD
        image: null,
        active_operator: null,
        created_at: new Date(),
        updated_at: new Date(),
        is_first_login: true,
        is_verified: true,
        verification_token: null,
        role: 'admin',
      },
    ]);

    console.log(` System admin user created with ID: ${adminUserId}`);
    console.log(`📧 Email: admin@gmail.com`);
    console.log(`🔑 Plain-text password was: ${PLAIN_TEXT_PASSWORD}`); // 👈 For your records (remove in prod logs)
    console.log(`🔒 Password is stored hashed in DB.`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      role: 'admin',
    });
    console.log('👑 System admin user deleted.');
  },
};
