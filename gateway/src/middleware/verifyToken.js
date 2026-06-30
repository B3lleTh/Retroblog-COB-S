const jwt = require('jsonwebtoken')

/**
 * Middleware que verifica el JWT en rutas protegidas.
 * Si el token es válido, agrega req.user con { userId, email }.
 * Los servicios internos reciben el userId como header x-user-id.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization']

  // Espera formato: "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido.' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    req.user = payload // { userId, email, iat, exp }
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado. Renueva tu sesión.' })
    }
    return res.status(401).json({ error: 'Token inválido.' })
  }
}

module.exports = verifyToken