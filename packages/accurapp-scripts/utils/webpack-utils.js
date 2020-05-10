const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const chalk = require('chalk')
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages')
const typescriptFormatter = require('react-dev-utils/typescriptFormatter')
const prettyMs = require('pretty-ms')
const ForkTsCheckerWebpackPlugin = require('react-dev-utils/ForkTsCheckerWebpackPlugin')
const { log, listLine } = require('./logging-utils')

const appDir = process.cwd()

function readWebpackConfig() {
  return require(path.resolve(appDir, 'webpack.config.js'))
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

  const useTypeScript = fs.existsSync(`${appDir}/tsconfig.json`)

  // You have changed a file, bundle is now "invalidated", and Webpack is recompiling a bundle.
  compiler.hooks.invalid.tap('invalid', (filePath) => {
    const filePathRelative = path.relative(appDir, filePath)
    console.log()
    log.info(`Compiling ${chalk.cyan(filePathRelative)}...`)
  })

  let isFirstCompile = true
  let tsMessagesPromise // used to wait for the typechecking
  let tsMessagesResolver // used to trigger the messages after the typechecking

  if (useTypeScript) {
    // reset the promise
    compiler.hooks.beforeCompile.tap('beforeCompile', () => {
      tsMessagesPromise = new Promise((resolve) => {
        tsMessagesResolver = (msgs) => resolve(msgs)
      })
    })

    // trigger the rest of done function
    ForkTsCheckerWebpackPlugin.getCompilerHooks(compiler).receive.tap(
      'afterTypeScriptCheck',
      (diagnostics, lints) => {
        const allMsgs = [...diagnostics, ...lints]
        const format = (message) => `${message.file}\n${typescriptFormatter(message, true)}`

        tsMessagesResolver({
          errors: allMsgs.filter((msg) => msg.severity === 'error').map(format),
          warnings: allMsgs.filter((msg) => msg.severity === 'warning').map(format),
        })
      }
    )
  }

  // Webpack has finished recompiling the bundle (whether or not you have warnings or errors)
  compiler.hooks.done.tap('done', async (stats) => {
    const statsData = stats.toJson({
      all: false,
      warnings: true,
      errors: true,
      timings: true,
    })

    if (useTypeScript && statsData.errors.length === 0) {
      // push typescript errors and warnings
      const messages = await tsMessagesPromise
      statsData.errors.push(...messages.errors)
      statsData.warnings.push(...messages.warnings)

      // Push errors and warnings into compilation result
      // to show them after page refresh triggered by user.
      stats.compilation.errors.push(...messages.errors)
      stats.compilation.warnings.push(...messages.warnings)

      if (compiler.devSocket) {
        if (messages.errors.length > 0) {
          compiler.devSocket.errors(messages.errors)
        } else if (messages.warnings.length > 0) {
          compiler.devSocket.warnings(messages.warnings)
        }
      }
    }

    const messages = formatWebpackMessages(statsData)
    const time = prettyMs(statsData.time)
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
      messages.warnings.forEach((message) => {
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
