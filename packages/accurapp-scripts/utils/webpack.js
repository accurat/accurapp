const path = require('path')
const webpack = require('webpack')
const chalk = require('chalk')
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages')
const prettyMs = require('pretty-ms')
const { log, listLine } = require('./logging')

function readWebpackConfig() {
  const cwd = process.cwd()
  return require(path.join(cwd, 'webpack.config.js'))
}

/*
 * The webpack "compiler" is a low-level interface to Webpack that lets us listen to
 * some events and provide our own custom messages.
 */
function createWebpackCompiler(onFirstReadyCallback = () => {}, onError = () => {}) {
  let compiler
  try {
    const config = readWebpackConfig()
    compiler = webpack(config)
  } catch (err) {
    log.err(`Failed to compile:\n${err.message || err}`)
    process.exit(1)
  }

  // You have changed a file, bundle is now "invalidated", and Webpack is recompiling a bundle
  compiler.hooks.invalid.tap('invalid', filePath => {
    const filePathRelative = path.relative(process.cwd(), filePath)
    console.log()
    log.info(`Compiling ${chalk.cyan(filePathRelative)}...`)
  })

  let isFirstCompile = true

  // Webpack has finished recompiling the bundle (whether or not you have warnings or errors)
  compiler.hooks.done.tap('done', stats => {
    const statsJson = stats.toJson({
      all: false,
      warnings: true,
      errors: true,
      timings: true,
    })

    const messages = formatWebpackMessages(statsJson)
    const time = prettyMs(statsJson.time)
    const isSuccessful = messages.errors.length + messages.warnings.length === 0

    if (isSuccessful) {
      log.ok(`Compiled successfully in ${chalk.cyan(time)}!`)
    } else if (messages.errors.length > 0) {
      log.err('Errors in compiling:')
      // Only log the first error. Others are often indicative
      // of the same problem, but confuse the reader with noise
      console.log(listLine(messages.errors[0], chalk.red))
      onError()
    } else if (messages.warnings.length > 0) {
      log.warn(`Compiled in ${chalk.cyan(time)} with warnings:`)
      messages.warnings.forEach(message => {
        console.log(listLine(message, chalk.yellow))
      })
    }

    // If the first time compiles, also with warnings,
    // call the onFirstReadyCallback
    if (isFirstCompile && messages.errors.length === 0) {
      onFirstReadyCallback()
      isFirstCompile = false
    }
  })

  return compiler
}

module.exports = {
  readWebpackConfig,
  createWebpackCompiler,
}
