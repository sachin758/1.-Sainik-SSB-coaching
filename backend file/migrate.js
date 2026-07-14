require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function migrate() {
  console.log('Applying schema...');
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await db.query(schema);
  console.log('Schema applied.');

  const { rows } = await db.query(`SELECT id FROM users WHERE role = 'admin' LIMIT 1`);
  if (rows.length === 0) {
    const name = process.env.SEED_ADMIN_NAME || 'Super Admin';
    const email = process.env.SEED_ADMIN_EMAIL;
    const password = process.env.SEED_ADMIN_PASSWORD;
    if (!email || !password) {
      console.log('No admin exists yet, and SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD are not set in .env — skipping admin seed. Set them and re-run `npm run migrate` to create the first admin.');
    } else {
      const hash = await bcrypt.hash(password, 12);
      await db.query(
        `INSERT INTO users (name, email, password_hash, role, status) VALUES ($1, $2, $3, 'admin', 'active')`,
        [name, email, hash]
      );
      console.log(`Seeded first admin account: ${email}`);
    }
  } else {
    console.log('An admin account already exists — skipping seed.');
  }

  console.log('Migration complete.');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
