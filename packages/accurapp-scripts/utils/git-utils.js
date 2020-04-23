const cp = require('child_process')
const browserslist = require('browserslist')

function extractBrowserslistString() {
  const appDir = process.cwd()
  const browsersListConfig = browserslist.loadConfig({ path: appDir })
  return Array.isArray(browsersListConfig) ? browsersListConfig.join(', ') : browsersListConfig
}

function extractLatestCommitHash() {
  try {
    return cp.execSync('git log -n1 --format=format:"%h"')
  } catch (e) {
    // Probably git is not available, return an empty string instead
    return ''
  }
}

function extractLatestCommitTimestamp() {
  try {
    const unixTimestamp = cp.execSync('git log -n1 --format=format:"%ct"')
    const utcTimestamp = `${unixTimestamp}000`
    return utcTimestamp
  } catch (e) {
    // Probably git is not available, return time of the build instead
    return Date.now()
  }
}

function extractLatestTag() {
  try {
    return cp.execSync('git describe --abbrev=0 --tags --always')
  } catch (e) {
    // Probably git is not available, return an empty string instead
    return ''
  }
}

function isInGitRepository() {
  try {
    cp.execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' })
    return true
  } catch (e) {
    return false
  }
}

module.exports = {
  extractBrowserslistString,
  extractLatestCommitHash,
  extractLatestCommitTimestamp,
  extractLatestTag,
  isInGitRepository,
}
