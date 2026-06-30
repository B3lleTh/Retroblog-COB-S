const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt')
const { sendVerificationEmail } = require('./email.service')

// Prisma 7: requiere adapter explícito
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

// OTP de 6 dígitos criptográficamente seguro
const generateOTP = () => crypto.randomInt(100000, 999999).toString()

// ─── REGISTRO ─────────────────────────────────────────────────────────────────
const register = async ({ email, password, name }) => {
  console.log('[register] start', email)
  const existing = await prisma.user.findUnique({ where: { email } })
  console.log('[register] findUnique done')
  if (existing) throw new Error('EMAIL_IN_USE')

  const hashedPassword = await bcrypt.hash(password, 12)
  console.log('[register] bcrypt done')

  const user = await prisma.user.create({
    data: { email, password: hashedPassword, name }
  })
  console.log('[register] user created', user.id)

  const code = generateOTP()
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

  await prisma.verifyCode.create({
    data: { code, userId: user.id, expiresAt }
  })
  console.log('[register] verifyCode created')

  await sendVerificationEmail(email, name, code)
  console.log('[register] email sent')

  return { message: 'Registro exitoso. Revisa tu email para verificar tu cuenta.' }
}

// ─── VERIFICAR EMAIL ──────────────────────────────────────────────────────────
const verifyEmail = async ({ email, code }) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { verifyCode: true }
  })

  if (!user) throw new Error('USER_NOT_FOUND')
  if (user.isVerified) throw new Error('ALREADY_VERIFIED')
  if (!user.verifyCode) throw new Error('NO_CODE_FOUND')
  if (user.verifyCode.code !== code) throw new Error('INVALID_CODE')
  if (new Date() > user.verifyCode.expiresAt) throw new Error('CODE_EXPIRED')

  // Transacción: marcar verificado + borrar código usado
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { isVerified: true } }),
    prisma.verifyCode.delete({ where: { userId: user.id } })
  ])

  return { message: 'Email verificado exitosamente. Ya puedes iniciar sesión.' }
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } })

  // Mismo error para email y password incorrectos (evita user enumeration)
  if (!user) throw new Error('INVALID_CREDENTIALS')
  if (!user.isVerified) throw new Error('NOT_VERIFIED')

  const passwordMatch = await bcrypt.compare(password, user.password)
  if (!passwordMatch) throw new Error('INVALID_CREDENTIALS')

  const accessToken = generateAccessToken(user)
  const refreshToken = generateRefreshToken(user)

  // Persistir refresh token para poder revocarlo
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  })

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, name: user.name }
  }
}

// ─── REFRESH TOKEN ────────────────────────────────────────────────────────────
const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) throw new Error('TOKEN_REVOKED')

  // Verificar firma JWT primero (lanza si expiró o es inválido)
  verifyRefreshToken(refreshToken)

  const tokenInDb = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true }
  })

  if (!tokenInDb) throw new Error('TOKEN_REVOKED')

  if (new Date() > tokenInDb.expiresAt) {
    await prisma.refreshToken.delete({ where: { token: refreshToken } })
    throw new Error('TOKEN_EXPIRED')
  }

  // Rotación: borrar el viejo y emitir uno nuevo (refresh token rotation)
  const newAccessToken = generateAccessToken(tokenInDb.user)
  const newRefreshToken = generateRefreshToken(tokenInDb.user)

  await prisma.$transaction([
    prisma.refreshToken.delete({ where: { token: refreshToken } }),
    prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: tokenInDb.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })
  ])

  return { accessToken: newAccessToken, refreshToken: newRefreshToken }
}

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
const logout = async (refreshToken) => {
  if (!refreshToken) return { message: 'Sesión cerrada' }
  // Borrar el refresh token de DB (revocarlo)
  // El access token expira solo en 15 min
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } })
  return { message: 'Sesión cerrada correctamente.' }
}

// ─── REENVIAR CÓDIGO OTP ──────────────────────────────────────────────────────
const resendCode = async ({ email }) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { verifyCode: true }
  })

  if (!user) throw new Error('USER_NOT_FOUND')
  if (user.isVerified) throw new Error('ALREADY_VERIFIED')

  const code = generateOTP()
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

  // upsert: actualiza si ya existe, crea si no
  await prisma.verifyCode.upsert({
    where: { userId: user.id },
    update: { code, expiresAt },
    create: { code, userId: user.id, expiresAt }
  })

  await sendVerificationEmail(email, user.name, code)

  return { message: 'Código reenviado. Revisa tu email.' }
}

module.exports = { register, verifyEmail, login, refreshAccessToken, logout, resendCode }