const pool = require('../config/db')

module.exports = {
  async findByAuth0Id(auth0Id) {
    const r = await pool.query('SELECT * FROM users WHERE auth0_id = $1', [auth0Id])
    return r.rows[0] || null
  },
  async incrementBlogCount(userId) {
    await pool.query('UPDATE users SET blogs_count = blogs_count + 1 WHERE id = $1', [userId])
  },
  async decrementBlogCount(userId) {
    await pool.query('UPDATE users SET blogs_count = blogs_count - 1 WHERE id = $1', [userId])
  }
}