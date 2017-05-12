process.on('unhandledRejection', err => { throw err })
process.env.NODE_ENV = 'production'

require('dotenv').config({ silent: true })

const chalk = require('chalk')
const path = require('path')
const fs = require('fs-extra')
const { log, createWebpackCompiler, coloredBanner } = require('./_utils')

function copyPublicFolder() {
  const appDir = process.cwd()
  const appPublic = path.join(appDir, 'public')
  const appBuild = path.join(appDir, 'build')
  fs.copySync(appPublic, appBuild, {
    overwrite: true,
    dereference: true,
    filter: file => path.basename(file) !== 'index.html',
  })
}

// Create the production build and print the deployment instructions.
function build() {
  log.info(`Copying ${chalk.cyan('public/')} folder...`)
  copyPublicFolder()

  log.info(`Creating an optimized production build...`)
  const compiler = createWebpackCompiler(() => {
    log.ok(`The ${chalk.cyan('build/')} folder is ready to be deployed.`)
  }, () => {
    log.err(`Aborting`)
    process.exit(2)
  })
  compiler.run(() => {})
}

console.log(coloredBanner('/||||/| accurapp', ['cyan', 'magenta']))
build()
