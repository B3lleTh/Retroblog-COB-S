const jwt = require('jsonwebtoken')

/**
 * Access token: vida corta (15 min), contiene userId y email.
 * Lo verifica el Gateway antes de routear a los servicios internos.
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  )
}

/**
 * Refresh token: vida larga (7 días), solo lleva el userId.
 * Se persiste en DB para poder revocarlo (logout, cambio de password, etc).
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  )
}

const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET)
}

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET)
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
}