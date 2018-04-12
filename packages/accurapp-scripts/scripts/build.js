process.env.NODE_ENV = 'production'
process.env.PUBLIC_URL = process.env.PUBLIC_URL || ''
process.env.GENERATE_SOURCEMAP = process.env.GENERATE_SOURCEMAP === 'true' ? 'true' : 'false'
require('dotenv').config() // gives precedence to the env variables already present

if (process.env.PUBLIC_URL.startsWith('/') || process.env.PUBLIC_URL.endsWith('/')) {
  throw new Error(`The PUBLIC_URL env variable cannot have trailing or leading slashes: '${process.env.PUBLIC_URL}'`)
}

const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')
const { log, createWebpackCompiler, readWebpackConfig, coloredBanner, printFileSizes } = require('./_utils')

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

clearBuildFolder()
copyPublicFolder()
build()
  .then((stats) => {
    log.info('File sizes:')
    console.log()
    printFileSizes(stats, appBuild)
    console.log()
  })
