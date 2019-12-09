require('dotenv').config() // gives precedence to the env variables already present
process.env.NODE_ENV = 'test'
process.env.PUBLIC_URL = ''

const path = require('path')
const jest = require('jest')
const { isInGitRepository } = require('../utils/git-utils')

const argv = process.argv.slice(2)

// Watch unless on CI or explicitly specified not tos
if (!process.env.CI && !argv.includes('--watch=false')) {
  // --watch needs a git repository because it runs only the edited test
  argv.push(isInGitRepository() ? '--watch' : '--watchAll')
}

// Load the config
const appDir = process.cwd()
const appJestConfig = path.resolve(appDir, 'jest.config.js')
argv.push('--config', JSON.stringify(appJestConfig))

jest.run(argv)
