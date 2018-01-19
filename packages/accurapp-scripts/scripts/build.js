process.on('unhandledRejection', err => { throw err })
process.env.NODE_ENV = process.env.NODE_ENV || 'production'
process.env.PUBLIC_URL = process.env.PUBLIC_URL || ''

require('dotenv').config({ silent: true })

const chalk = require('chalk')
const path = require('path')
const fs = require('fs-extra')
const { measureFileSizesBeforeBuild, printFileSizesAfterBuild } = require('react-dev-utils/FileSizeReporter')
const { log, createWebpackCompiler, readWebpackConfig, coloredBanner } = require('./_utils')

const appDir = process.cwd()
const config = readWebpackConfig()
const appPublic = path.join(appDir, 'public')
const appBuild = config.output.path
const relativeAppBuildPath = `${path.relative(appDir, appBuild)}/`

function clearBuildFolder() {
  log.info(`Cleaning ${chalk.cyan(relativeAppBuildPath)}`)
  fs.emptyDirSync(appBuild)
}

function copyPublicFolder() {
  log.info(`Copying ${chalk.cyan('public/')} into ${chalk.cyan(relativeAppBuildPath)}`)
  fs.copySync(appPublic, appBuild, {
    overwrite: true,
    dereference: true,
    filter: file => path.basename(file) !== 'index.html',
  })
}

// Create the production build and print the deployment instructions.
function build() {
  log.info(`Creating an optimized production build...`)
  const compiler = createWebpackCompiler(() => {
    log.ok(`The ${chalk.cyan(relativeAppBuildPath)} folder is ready to be deployed.`)
  }, () => {
    log.err(`Aborting`)
    process.exit(2)
  })

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

measureFileSizesBeforeBuild(appBuild)
  .then((previousFileSizes) => {
    clearBuildFolder()
    copyPublicFolder()
    build()
      .then((stats) => {
        log.info('File sizes after gzip:')
        console.log()
        printFileSizesAfterBuild(stats, previousFileSizes, appBuild)
        console.log()
      })
  })
