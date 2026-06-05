const slugify   = require('slugify')
const userModel = require('../models/user.model')
const blogModel = require('../models/blog.model')

async function generateUniqueSlug(title) {
  let slug    = slugify(title, { lower: true, strict: true })
  let exists  = await blogModel.findBySlug(slug)
  let counter = 2
  while (exists) {
    const candidate = `${slug}-${counter++}`
    exists = await blogModel.findBySlug(candidate)
    if (!exists) { slug = candidate; break }
  }
  return slug
}

module.exports = {
  async getMyBlogs(auth0Id) {
    const user = await userModel.findByAuth0Id(auth0Id)
    if (!user) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 })
    return blogModel.findByUser(user.id)
  },
  async create(auth0Id, { title, description }) {
    const user = await userModel.findByAuth0Id(auth0Id)
    if (!user) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 })
    const slug = await generateUniqueSlug(title)
    const blog = await blogModel.create(user.id, title, slug, description)
    await userModel.incrementBlogCount(user.id)
    return blog
  },
  async update(auth0Id, blogId, fields) {
    const user = await userModel.findByAuth0Id(auth0Id)
    const blog = await blogModel.findById(blogId)
    if (!blog) throw Object.assign(new Error('Blog no encontrado'), { status: 404 })
    if (blog.user_id !== user.id) throw Object.assign(new Error('Sin permiso'), { status: 403 })
    return blogModel.update(blogId, fields)
  },
  async delete(auth0Id, blogId) {
    const user = await userModel.findByAuth0Id(auth0Id)
    const blog = await blogModel.findById(blogId)
    if (!blog) throw Object.assign(new Error('Blog no encontrado'), { status: 404 })
    if (blog.user_id !== user.id) throw Object.assign(new Error('Sin permiso'), { status: 403 })
    await blogModel.delete(blogId)
    await userModel.decrementBlogCount(user.id)
  }
}