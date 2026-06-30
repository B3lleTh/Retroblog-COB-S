const { validationResult, body } = require('express-validator')

// Middleware genérico que corta la request si hay errores de validación
const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: errors.array()[0].msg // solo devuelve el primer error (más limpio para el front)
    })
  }
  next()
}

const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ max: 100 }).withMessage('El nombre es demasiado largo'),
  body('email')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
]

const loginRules = [
  body('email')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
]

const verifyRules = [
  body('email')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  body('code')
    .isLength({ min: 6, max: 6 }).withMessage('El código debe tener 6 dígitos')
    .isNumeric().withMessage('El código solo debe contener números')
]

const resendRules = [
  body('email')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail()
]

module.exports = { validate, registerRules, loginRules, verifyRules, resendRules }