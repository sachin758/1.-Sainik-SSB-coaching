const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { signToken } = require('../utils/jwt');

// Public self-registration. Deliberately hardcodes role='student' — a client
// can never grant itself admin/faculty by sending a different role field.
// Faculty and admin accounts are created by an existing admin (see
// userController.createStaffUser).
async function register(req, res) {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const { rows } = await db.query(
    `INSERT INTO users (name, email, phone, password_hash, role, status)
     VALUES ($1, $2, $3, $4, 'student', 'active')
     RETURNING id, name, email, role, status, created_at`,
    [name, email.toLowerCase().trim(), phone || null, passwordHash]
  );

  const user = rows[0];
  const token = signToken(user);
  res.status(201).json({ token, user });
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const { rows } = await db.query(`SELECT * FROM users WHERE email = $1`, [email.toLowerCase().trim()]);
  const user = rows[0];

  // Same generic error whether the email doesn't exist or the password is
  // wrong — this avoids leaking which emails are registered.
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  if (user.status !== 'active') {
    return res.status(403).json({ error: 'This account is not active. Contact the academy office.' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = signToken(user);
  delete user.password_hash;
  res.json({ token, user });
}

async function me(req, res) {
  const { rows } = await db.query(
    `SELECT id, name, email, phone, role, status, created_at FROM users WHERE id = $1`,
    [req.user.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'User not found.' });
  res.json({ user: rows[0] });
}

module.exports = { register, login, me };
