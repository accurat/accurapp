require('dotenv').config() // gives precedence to the env variables already present
process.env.NODE_ENV = 'test'
process.env.PUBLIC_URL = ''

const jest = require('jest')
const { isInGitRepository } = require('../utils/git-utils')
let argv = process.argv.slice(2)

// Watch unless on CI or explicitly running all tests
if (!process.env.CI && !argv.includes('--watch=false')) {
  // --watch needs a git repository because it runs only the edited test
  argv.push(isInGitRepository() ? '--watch' : '--watchAll')
}

// @remove-on-eject-begin
// This is not necessary after eject because we embed config into package.json.
const createJestConfig = require('./utils/createJestConfig')
const path = require('path')
const paths = require('../config/paths')
argv.push(
  '--config',
  JSON.stringify(
    createJestConfig(
      relativePath => path.resolve(__dirname, '..', relativePath),
      path.resolve(paths.appSrc, '..'),
      false
    )
  )
)

// This is a very dirty workaround for https://github.com/facebook/jest/issues/5913.
// We're trying to resolve the environment ourselves because Jest does it incorrectly.
// TODO: remove this as soon as it's fixed in Jest.
const resolve = require('resolve')
function resolveJestDefaultEnvironment(name) {
  const jestDir = path.dirname(
    resolve.sync('jest', {
      basedir: __dirname,
    })
  )
  const jestCLIDir = path.dirname(
    resolve.sync('jest-cli', {
      basedir: jestDir,
    })
  )
  const jestConfigDir = path.dirname(
    resolve.sync('jest-config', {
      basedir: jestCLIDir,
    })
  )
  return resolve.sync(name, {
    basedir: jestConfigDir,
  })
}
let cleanArgv = []
let env = 'jsdom'
let next
do {
  next = argv.shift()
  if (next === '--env') {
    env = argv.shift()
  } else if (next.indexOf('--env=') === 0) {
    env = next.substring('--env='.length)
  } else {
    cleanArgv.push(next)
  }
} while (argv.length > 0)
argv = cleanArgv
let resolvedEnv
try {
  resolvedEnv = resolveJestDefaultEnvironment(`jest-environment-${env}`)
} catch (e) {
  // ignore
}
if (!resolvedEnv) {
  try {
    resolvedEnv = resolveJestDefaultEnvironment(env)
  } catch (e) {
    // ignore
  }
}
const testEnvironment = resolvedEnv || env
argv.push('--env', testEnvironment)
// @remove-on-eject-end

jest.run(argv)
