const blogService = require('../services/blog.service')

module.exports = {
  async getMyBlogs(req, res, next) {
    try {
      const blogs = await blogService.getMyBlogs(req.auth.sub)
      res.json(blogs)
    } catch (err) { next(err) }
  },
  async createBlog(req, res, next) {
    try {
      const blog = await blogService.create(req.auth.sub, req.body)
      res.status(201).json(blog)
    } catch (err) { next(err) }
  },
  async updateBlog(req, res, next) {
    try {
      const blog = await blogService.update(req.auth.sub, req.params.id, req.body)
      res.json(blog)
    } catch (err) { next(err) }
  },
  async deleteBlog(req, res, next) {
    try {
      await blogService.delete(req.auth.sub, req.params.id)
      res.json({ message: 'Blog eliminado' })
    } catch (err) { next(err) }
  }
}