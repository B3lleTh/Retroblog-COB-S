require('dotenv').config()
const fs   = require('fs')
const path = require('path')
const { Pool } = require('pg')

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
})

const migrationsDir = path.join(__dirname, 'migrations')

async function migrate() {
  const files = fs.readdirSync(migrationsDir).sort()

  for (const file of files) {
    if (!file.endsWith('.sql')) continue
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
    console.log(`Corriendo migración: ${file}`)
    await pool.query(sql)
    console.log(`Listo: ${file}`)
  }

  console.log('Todas las migraciones completadas')
  await pool.end()
}

migrate().catch((err) => {
  console.error('Error en migración:', err.message)
  process.exit(1)
})