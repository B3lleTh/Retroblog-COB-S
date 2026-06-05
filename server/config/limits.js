module.exports = {
  MAX_BLOGS_PER_USER: parseInt(process.env.MAX_BLOGS_PER_USER) || 3,
  MAX_MEDIA_SIZE_MB:  parseInt(process.env.MAX_MEDIA_SIZE_MB)  || 5,
}