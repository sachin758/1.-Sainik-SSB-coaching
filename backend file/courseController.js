const db = require('../config/db');

function slugify(str) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function listCourses(req, res) {
  const { rows } = await db.query(
    `SELECT id, name, slug, description, duration, fee, is_active, created_at
     FROM courses WHERE is_active = true ORDER BY created_at DESC`
  );
  res.json({ courses: rows });
}

async function createCourse(req, res) {
  const { name, description, duration, fee } = req.body;
  if (!name) return res.status(400).json({ error: 'Course name is required.' });

  const { rows } = await db.query(
    `INSERT INTO courses (name, slug, description, duration, fee) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [name, slugify(name), description || null, duration || null, fee || 0]
  );
  res.status(201).json({ course: rows[0] });
}

async function updateCourse(req, res) {
  const { id } = req.params;
  const { name, description, duration, fee, is_active } = req.body;
  const { rows } = await db.query(
    `UPDATE courses SET
       name = COALESCE($1, name),
       description = COALESCE($2, description),
       duration = COALESCE($3, duration),
       fee = COALESCE($4, fee),
       is_active = COALESCE($5, is_active)
     WHERE id = $6 RETURNING *`,
    [name, description, duration, fee, is_active, id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Course not found.' });
  res.json({ course: rows[0] });
}

async function deleteCourse(req, res) {
  const { id } = req.params;
  const { rowCount } = await db.query(`DELETE FROM courses WHERE id = $1`, [id]);
  if (!rowCount) return res.status(404).json({ error: 'Course not found.' });
  res.status(204).send();
}

module.exports = { listCourses, createCourse, updateCourse, deleteCourse };
