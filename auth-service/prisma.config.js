require('dotenv').config()
const { defineConfig } = require('prisma/config')
const { PrismaPg } = require('@prisma/adapter-pg')

module.exports = defineConfig({
  earlyAccess: true,
  schema: 'prisma/schema.prisma',
  migrate: {
    adapter: () => new PrismaPg({ connectionString: process.env.DATABASE_URL })
  }
})