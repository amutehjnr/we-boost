// backend/add-withdrawal-columns.js
// One-off script: run locally to add the new columns Paystack transfer
// integration needs. sync({ alter: false }) deliberately never alters
// existing tables, so this needs a manual run.
// Usage: node add-withdrawal-columns.js

require('dotenv').config();
require('mysql2');
const { sequelize } = require('./config/database');

(async () => {
  try {
    await sequelize.authenticate();

    const queries = [
      `ALTER TABLE withdrawals ADD COLUMN bank_code VARCHAR(255) NULL AFTER bank_name`,
      `ALTER TABLE withdrawals ADD COLUMN paystack_recipient_code VARCHAR(255) NULL`,
      `ALTER TABLE withdrawals ADD COLUMN transfer_code VARCHAR(255) NULL`
    ];

    for (const query of queries) {
      try {
        await sequelize.query(query);
        console.log(`✅ ${query}`);
      } catch (err) {
        if (err.original?.code === 'ER_DUP_FIELDNAME') {
          console.log(`↷ Column already exists, skipping: ${query}`);
        } else {
          throw err;
        }
      }
    }

    console.log('✅ withdrawals table updated for Paystack transfers.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed:', err);
    process.exit(1);
  }
})();