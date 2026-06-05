const pool = require('../config/db')

module.exports = {
  async findByUser(userId) {
    const r = await pool.query(
      'SELECT id, title, slug, description, status, created_at FROM blogs WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    )
    return r.rows
  },
  async findById(id) {
    const r = await pool.query('SELECT * FROM blogs WHERE id = $1', [id])
    return r.rows[0] || null
  },
  async findBySlug(slug) {
    const r = await pool.query('SELECT id FROM blogs WHERE slug = $1', [slug])
    return r.rows[0] || null
  },
  async create(userId, title, slug, description) {
    const r = await pool.query(
      'INSERT INTO blogs (user_id, title, slug, description) VALUES ($1,$2,$3,$4) RETURNING *',
      [userId, title, slug, description || '']
    )
    return r.rows[0]
  },
  async update(id, fields) {
    const keys   = Object.keys(fields)
    const values = Object.values(fields)
    const sets   = keys.map((k, i) => `${k} = $${i + 2}`).join(', ')
    const r = await pool.query(
      `UPDATE blogs SET ${sets}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    )
    return r.rows[0]
  },
  async delete(id) {
    await pool.query('DELETE FROM blogs WHERE id = $1', [id])
  }
}