require('dotenv').config()

const required = ['PORT', 'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD']

required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Falta la variable de entorno: ${key}`)
  }
})

module.exports = {
  port: process.env.PORT || 3000,
  db: {
    host:     process.env.DB_HOST,
    port:     parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigins: process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  maxBlogsPerUser: parseInt(process.env.MAX_BLOGS_PER_USER) || 3,
}