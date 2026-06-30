const router = require('express').Router()
const ctrl = require('../controllers/auth.controller')
const {
  validate,
  registerRules,
  loginRules,
  verifyRules,
  resendRules
} = require('../middleware/validate')

// Todas las rutas son públicas (no requieren JWT)
// El JWT solo lo verifica el Gateway para las rutas de otros servicios

router.post('/register',      registerRules, validate, ctrl.register)
router.post('/verify-email',  verifyRules,   validate, ctrl.verifyEmail)
router.post('/login',         loginRules,    validate, ctrl.login)
router.post('/logout',        ctrl.logout)
router.post('/refresh',       ctrl.refresh)
router.post('/resend-code',   resendRules,   validate, ctrl.resendCode)

module.exports = router