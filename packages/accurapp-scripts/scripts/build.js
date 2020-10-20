require('dotenv').config() // gives precedence to the env variables already present
process.env.NODE_ENV = 'production'
process.env.PUBLIC_URL = process.env.PUBLIC_URL || ''
process.env.TRANSPILE_NODE_MODULES = process.env.TRANSPILE_NODE_MODULES || 'true'
process.env.GENERATE_SOURCEMAP = process.env.GENERATE_SOURCEMAP === 'true' ? 'true' : 'false'

const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')
const { log, coloredBanner, printFileSizes } = require('../utils/logging-utils')
const { createWebpackCompiler, readWebpackConfig } = require('../utils/webpack-utils')
const {
  extractBrowserslistString,
  extractLatestCommitHash,
  extractLatestCommitTimestamp,
  extractLatestTag,
} = require('../utils/git-utils')

process.env.BROWSERSLIST = extractBrowserslistString()
process.env.LATEST_COMMIT = extractLatestCommitHash()
process.env.LATEST_COMMIT_TIMESTAMP = extractLatestCommitTimestamp()
process.env.LATEST_TAG = extractLatestTag()
if (process.env.PUBLIC_URL.endsWith('/')) {
  process.env.PUBLIC_URL = process.env.PUBLIC_URL.slice(0, -1)
}

const appDir = process.cwd()
const config = readWebpackConfig()
const appPublic = path.resolve(appDir, 'public')
const appBuild = config.output.path
const relativeAppBuildPath = `${path.relative(appDir, appBuild)}/`

function clearBuildFolder() {
  log.info(`Cleaning ${chalk.cyan(relativeAppBuildPath)}`)
  fs.emptyDirSync(appBuild)
}

function copyPublicFolder() {
  if (!fs.existsSync(appPublic)) {
    return
  }

  log.info(`Copying ${chalk.cyan('public/')} into ${chalk.cyan(relativeAppBuildPath)}`)
  fs.copySync(appPublic, appBuild, {
    overwrite: true,
    dereference: true,
    filter: (file) => !file.endsWith('/public/index.html'),
  })
}

// Create the production build and print the deployment instructions.
function build() {
  log.info(`Creating an optimized production build...`)
  const compiler = createWebpackCompiler(
    () => {
      log.ok(`The ${chalk.cyan(relativeAppBuildPath)} folder is ready to be deployed.`)
    },
    () => {
      log.err(`Aborting`)
      process.exit(2)
    }
  )

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        return reject(err)
      }

      return resolve(stats)
    })
  })
}

console.log(coloredBanner('/||||/| accurapp', ['cyan', 'magenta']))

clearBuildFolder()
copyPublicFolder()
build().then((stats) => {
  log.info('File sizes:')
  console.log()
  printFileSizes(stats, appBuild)
  console.log()
})
