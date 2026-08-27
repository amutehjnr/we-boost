// backend/add-platforms.js
// One-off script: run locally to expand the linked_accounts.platform
// ENUM with new platforms. sync({ alter: false }) deliberately never
// alters existing columns, so this needs a manual run.
// Usage: node add-platforms.js

require('dotenv').config();
require('mysql2');
const { sequelize } = require('./config/database');

(async () => {
  try {
    await sequelize.authenticate();

    await sequelize.query(`
      ALTER TABLE linked_accounts
      MODIFY COLUMN platform ENUM(
        'Facebook',
        'Instagram',
        'TikTok',
        'Twitter',
        'YouTube',
        'Spotify',
        'Audiomack',
        'YoutubeMusic',
        'LinkedIn',
        'Twitch',
        'Telegram'
      ) NOT NULL
    `);

    console.log('✅ linked_accounts.platform ENUM updated with Twitch and Telegram.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed:', err);
    process.exit(1);
  }
})();