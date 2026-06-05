const pool = require('../config/db')
const { v4: uuidv4 } = require('uuid')

async function syncUser(req, res) {
  try {
    const auth0Id = req.auth.sub
    const email   = req.auth[`${process.env.AUTH0_DOMAIN}/email`] || req.auth.email || ''
    const username = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') + '_' + Date.now().toString().slice(-4)

    // Busca si ya existe
    const existing = await pool.query(
      'SELECT id FROM users WHERE auth0_id = $1',
      [auth0Id]
    )

    if (existing.rows.length > 0) {
      return res.json({ message: 'Usuario ya existe', userId: existing.rows[0].id })
    }

    // Crea el usuario nuevo
    const result = await pool.query(
      'INSERT INTO users (auth0_id, username, email) VALUES ($1, $2, $3) RETURNING id',
      [auth0Id, username, email]
    )

    res.status(201).json({ message: 'Usuario creado', userId: result.rows[0].id })
  } catch (err) {
    console.error('Error en sync:', err.message)
    res.status(500).json({ error: 'Error al sincronizar usuario' })
  }
}

module.exports = { syncUser }