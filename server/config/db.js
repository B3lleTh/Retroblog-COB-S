const { Pool } = require('pg')
const { db } = require('./env')

const pool = new Pool(db)

pool.on('connect', () => {
  console.log('Conectado a PostgreSQL')
})

pool.on('error', (err) => {
  console.error('Error en PostgreSQL:', err.message)
  process.exit(1)
})

module.exports = pool