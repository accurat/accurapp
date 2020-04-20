module.exports = {
  process() {
    // Return empty object
    return 'module.exports = {}'
  },
  getCacheKey() {
    // The output is always the same.
    return 'cssTransform'
  },
}
