const app  = require('./app')
const pool = require('./config/db')
const { port } = require('./config/env')

async function start() {
  try {
    await pool.query('SELECT 1') // Prueba la conexión
    app.listen(port, () => {
      console.log(`Server Running in http://localhost:${port}`)
    })
  } catch (err) {
    console.error('Couldnt Connect to DB:', err.message)
    process.exit(1)
  }
}

start()