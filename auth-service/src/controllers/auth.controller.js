const authService = require('../services/auth.service')

// Mapeo de errores internos → respuestas HTTP claras para el front
const ERROR_MAP = {
  EMAIL_IN_USE:         { status: 409, message: 'Este email ya está registrado.' },
  USER_NOT_FOUND:       { status: 404, message: 'No encontramos una cuenta con ese email.' },
  INVALID_CREDENTIALS:  { status: 401, message: 'Email o contraseña incorrectos.' },
  NOT_VERIFIED:         { status: 403, message: 'Verifica tu email antes de iniciar sesión.' },
  ALREADY_VERIFIED:     { status: 400, message: 'Esta cuenta ya está verificada.' },
  INVALID_CODE:         { status: 400, message: 'El código es incorrecto.' },
  CODE_EXPIRED:         { status: 400, message: 'El código expiró. Solicita uno nuevo.' },
  NO_CODE_FOUND:        { status: 400, message: 'No hay un código pendiente para este email.' },
  TOKEN_REVOKED:        { status: 401, message: 'Sesión inválida. Inicia sesión de nuevo.' },
  TOKEN_EXPIRED:        { status: 401, message: 'Sesión expirada. Inicia sesión de nuevo.' },
  EMAIL_SEND_FAILED:    { status: 502, message: 'No se pudo enviar el email. Intenta de nuevo.' }
}

// Wrapper que captura errores y los transforma en respuestas HTTP consistentes
const handle = (fn) => async (req, res) => {
  try {
    const result = await fn(req, res)
    res.json(result)
  } catch (err) {
    const mapped = ERROR_MAP[err.message]
    if (mapped) {
      return res.status(mapped.status).json({ error: mapped.message })
    }
    // Error no mapeado = inesperado, loguear en servidor
    console.error('[AuthController] Error no manejado:', err)
    res.status(500).json({ error: 'Error interno del servidor.' })
  }
}

module.exports = {
  register:    handle((req) => authService.register(req.body)),
  verifyEmail: handle((req) => authService.verifyEmail(req.body)),
  login:       handle((req) => authService.login(req.body)),
  logout:      handle((req) => authService.logout(req.body.refreshToken)),
  refresh:     handle((req) => authService.refreshAccessToken(req.body.refreshToken)),
  resendCode:  handle((req) => authService.resendCode(req.body))
}