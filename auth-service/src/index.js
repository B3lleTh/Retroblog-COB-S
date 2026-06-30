require('dotenv').config()
const express = require('express')
const cors = require('cors')
const authRoutes = require('./routes/auth.routes')

const app = express()

// CORS: permite peticiones del frontend local
// En producción reemplaza los orígenes con tu dominio real
app.use(cors({
  origin: (origin, callback) => {
    // Permite cualquier puerto en localhost/127.0.0.1 (dev) y requests sin origin (Postman)
    if (!origin || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true)
    }
    callback(new Error('Not allowed by CORS'))
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())

app.use('/auth', authRoutes)

// Health check para monitoreo y para que el Gateway sepa si está vivo
app.get('/health', (_, res) => res.json({ status: 'ok', service: 'auth', timestamp: new Date() }))

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`✅ Auth service corriendo en http://localhost:${PORT}`)
})