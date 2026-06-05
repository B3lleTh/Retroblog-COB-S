const express    = require('express')
const helmet     = require('helmet')
const cors       = require('cors')
const rateLimit  = require('express-rate-limit')
const path       = require('path')
const { corsOrigins } = require('./config/env')

const app = express()

// Seguridad
app.use(helmet())
app.use(cors({ origin: corsOrigins, credentials: true }))

// Rate limit: máximo 100 requests por minuto por IP
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Demasiadas peticiones, espera un momento' }
}))

// Body parser
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true }))

// Archivos estáticos (frontend)
app.use(express.static(path.join(__dirname, '../public')))

// Rutas API (Joder andamos en eso aguanten)
  app.use('/api/auth',    require('./routes/auth.routes'))
// app.use('/api/users',   require('./routes/user.routes'))
// app.use('/api/blogs',   require('./routes/blog.routes'))
// app.use('/api/content', require('./routes/content.routes'))

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})

// Error handler global
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' })
})

module.exports = app