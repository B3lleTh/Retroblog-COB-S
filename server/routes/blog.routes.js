const router     = require('express').Router()
const auth       = require('../middleware/auth')
const checkLimit = require('../middleware/check-blog-limit')
const ctrl       = require('../controllers/blog.controller')

router.get('/',       auth, ctrl.getMyBlogs)
router.post('/',      auth, checkLimit, ctrl.createBlog)
router.patch('/:id',  auth, ctrl.updateBlog)
router.delete('/:id', auth, ctrl.deleteBlog)

module.exports = router