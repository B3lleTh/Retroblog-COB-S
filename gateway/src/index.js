require('dotenv').config()
const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware')
const rateLimit = require('express-rate-limit')
const cors = require('cors')
const verifyToken = require('./middleware/verifyToken')

const app = express()

// CORS: mismos orígenes que el auth-service
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true)
    }
    callback(new Error('Not allowed by CORS'))
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// NOTA: NO usamos express.json() global aquí.
// http-proxy-middleware necesita el body crudo (raw stream) para reenviarlo
// a auth-service/blog-service; si express.json() lo parsea antes, el stream
// queda vacío y la request se cuelga sin nunca llegar al servicio destino.

// Rate limiting global: 100 requests por 15 min por IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones. Espera un momento.' }
})
app.use(limiter)

// ── Rutas PÚBLICAS de auth (sin JWT) ─────────────────────────────────────────
app.use('/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: (path) => '/auth' + path,
  on: {
    error: (err, req, res) => {
      console.error('[Gateway] Error al conectar con auth-service:', err.message)
      res.status(503).json({ error: 'Servicio de autenticación no disponible.' })
    }
  }
}))

// ── Rutas PROTEGIDAS de blog (requieren JWT válido) ───────────────────────────
app.use('/blog', verifyToken, createProxyMiddleware({
  target: process.env.BLOG_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: (path) => '/blog' + path,
  on: {
    proxyReq: (proxyReq, req) => {
      // Pasar identidad del usuario verificado al servicio interno
      proxyReq.setHeader('x-user-id', req.user.userId)
      proxyReq.setHeader('x-user-email', req.user.email)
    },
    error: (err, req, res) => {
      console.error('[Gateway] Error al conectar con blog-service:', err.message)
      res.status(503).json({ error: 'Servicio de blog no disponible.' })
    }
  }
}))

// Health check
app.get('/health', (_, res) => res.json({
  status: 'ok',
  service: 'gateway',
  timestamp: new Date(),
  upstreams: {
    auth: process.env.AUTH_SERVICE_URL,
    blog: process.env.BLOG_SERVICE_URL
  }
}))

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.path}` })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`✅ Gateway corriendo en http://localhost:${PORT}`)
})