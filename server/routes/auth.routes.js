const express = require('express')
const router  = express.Router()
const { syncUser } = require('../controllers/auth.controller')
const auth = require('../middleware/auth')

router.post('/sync', auth, syncUser)

module.exports = router