'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const oldEnumName = 'enum_user_subscriptions_tier';
    const newEnumName = 'enum_user_subscriptions_tier_new';

    // Step 1: Remove the default value from the column.
    // This is the crucial step to resolve the error.
    await queryInterface.sequelize.query(`
      ALTER TABLE "user_subscriptions"
      ALTER COLUMN "tier" DROP DEFAULT;
    `);

    // Step 2: Rename the old ENUM.
    await queryInterface.sequelize.query(`
      ALTER TYPE "${oldEnumName}" RENAME TO "${newEnumName}";
    `);

    // Step 3: Create the new ENUM type with the 'trial' value.
    await queryInterface.sequelize.query(`
      CREATE TYPE "${oldEnumName}" AS ENUM('trial', 'core', 'pro');
    `);

    // Step 4: Update the 'tier' column to use the new ENUM and migrate the data.
    await queryInterface.sequelize.query(`
      ALTER TABLE "user_subscriptions"
      ALTER COLUMN "tier" TYPE "${oldEnumName}"
      USING CASE "tier"::text
        WHEN 'free' THEN 'trial'
        ELSE "tier"::text
      END::"${oldEnumName}";
    `);

    // Step 5: Drop the old (renamed) ENUM type.
    await queryInterface.sequelize.query(`
      DROP TYPE "${newEnumName}";
    `);

    // Step 6: Set the new default value for the column.
    await queryInterface.sequelize.query(`
      ALTER TABLE "user_subscriptions"
      ALTER COLUMN "tier" SET DEFAULT 'trial';
    `);
  },

  async down(queryInterface, Sequelize) {
    const oldEnumName = 'enum_user_subscriptions_tier';
    const newEnumName = 'enum_user_subscriptions_tier_new';

    // Revert the default value change first.
    await queryInterface.sequelize.query(`
      ALTER TABLE "user_subscriptions"
      ALTER COLUMN "tier" DROP DEFAULT;
    `);

    // Rename the current ENUM to a temporary name.
    await queryInterface.sequelize.query(`
      ALTER TYPE "${oldEnumName}" RENAME TO "${newEnumName}";
    `);

    // Create the old ENUM with the 'free' value.
    await queryInterface.sequelize.query(`
      CREATE TYPE "${oldEnumName}" AS ENUM('free', 'core', 'pro');
    `);

    // Update the 'tier' column to use the old ENUM type.
    await queryInterface.sequelize.query(`
      ALTER TABLE "user_subscriptions"
      ALTER COLUMN "tier" TYPE "${oldEnumName}"
      USING CASE "tier"::text
        WHEN 'trial' THEN 'free'
        ELSE "tier"::text
      END::"${oldEnumName}";
    `);

    // Drop the new (renamed) ENUM type.
    await queryInterface.sequelize.query(`
      DROP TYPE "${newEnumName}";
    `);

    // Restore the original default value.
    await queryInterface.sequelize.query(`
      ALTER TABLE "user_subscriptions"
      ALTER COLUMN "tier" SET DEFAULT 'free';
    `);
  },
};
