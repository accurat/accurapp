const os = require('os')
const { extractRepoName, extractCurrentBranch } = require('../utils/git-utils')

function generateSubdomain() {
  const repo = extractRepoName()
  const branch = extractCurrentBranch()
  if (!repo) return os.hostname()
  if (branch === 'master') return repo
  return `${branch}.${repo}`
}

module.exports = { generateSubdomain }
