const bcrypt = require('bcryptjs');
const db = require('../config/db');

// Only an authenticated admin can reach this (see routes/userRoutes.js),
// so it's safe to trust the `role` field here.
async function createStaffUser(req, res) {
  const { name, email, password, phone, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password, and role are required.' });
  }
  if (!['admin', 'faculty'].includes(role)) {
    return res.status(400).json({ error: "Role must be 'admin' or 'faculty' (students self-register)." });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const { rows } = await db.query(
    `INSERT INTO users (name, email, phone, password_hash, role, status)
     VALUES ($1, $2, $3, $4, $5, 'active')
     RETURNING id, name, email, role, status, created_at`,
    [name, email.toLowerCase().trim(), phone || null, passwordHash, role]
  );
  res.status(201).json({ user: rows[0] });
}

async function listUsers(req, res) {
  const { role, status, search } = req.query;
  const conditions = [];
  const params = [];

  if (role) {
    params.push(role);
    conditions.push(`role = $${params.length}`);
  }
  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(name ILIKE $${params.length} OR email ILIKE $${params.length})`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await db.query(
    `SELECT id, name, email, phone, role, status, created_at FROM users ${where} ORDER BY created_at DESC LIMIT 200`,
    params
  );
  res.json({ users: rows });
}

async function updateUserStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  if (!['active', 'inactive', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }
  const { rows } = await db.query(
    `UPDATE users SET status = $1, updated_at = now() WHERE id = $2 RETURNING id, name, email, role, status`,
    [status, id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'User not found.' });
  res.json({ user: rows[0] });
}

module.exports = { createStaffUser, listUsers, updateUserStatus };
