process.on('unhandledRejection', err => { throw err })
process.env.NODE_ENV = 'development'
process.env.PUBLIC_URL = ''

require('dotenv').config({ silent: true })

const HOST = process.env.HOST || 'localhost'
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 8000
const APPDIR = process.cwd()

const path = require('path')
const chalk = require('chalk')
const figlet = require('figlet')
const detect = require('detect-port')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const openOrRefreshBrowser = require('react-dev-utils/openBrowser')
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages')

const log = {
  ok(...a) { console.log('::: ' + chalk.yellow(...a)) },
  warn(...a) { console.error('!!! ' + chalk.yellow(...a)) },
  err(...a) { console.error('!!! ' + chalk.red(...a)) },
  info(...a) { console.log('--- ' + chalk.blue(...a)) },
}

function noop() {}

function coloredBanner(text, colors = ['blue', 'red']) {
  const bannerText = text.replace(/\|/g, 'l') // In BigMoney font, 'l' (lowercase L) are much nicer than '|' (pipes)
  const bannerColors = { '$': colors[0], '_': colors[1], '|': colors[1], '\\': colors[1], '/': colors[1] }
  const banner = figlet.textSync(bannerText, { font: 'Big Money-nw' })
  const colored = banner.replace(/[^\s]/g, (c) => chalk[bannerColors[c] || 'white'](c))
  return `\n${colored}`
}

function indent(text, prepend = '  ', firstLinePrepend = prepend) {
  return text
    .split(`\n`)
    .map((line, i) => `${i === 0 ? firstLinePrepend : prepend}${line}`)
    .join(`\n`)
}

function listLine(text, color = i => i) {
  return indent(text, '   ', color('\n • '))
}

const config = require(path.join(APPDIR, 'webpack.config.js'))
const devServerConfig = {
  compress: true,
  clientLogLevel: 'none',
  hot: true,
  contentBase: './public/',
  quiet: true,
  watchOptions: {
    ignored: /node_modules/,
  },
  host: HOST,
  overlay: false,
}

const isInteractive = process.stdout.isTTY

function createWebpackCompiler(config, onFirstReadyCallback = noop) {
  // "Compiler" is a low-level interface to Webpack that lets us listen to some events and provide our own custom messages.
  let compiler
  try {
    compiler = webpack(config)
  } catch (err) {
    log.err(`Failed to compile:\n${err.message || err}`)
    process.exit(1)
  }

  // You have changed a file, bundle is now "invalidated", and Webpack is recompiling a bundle
  compiler.plugin('invalid', (filePath) => {
    const filePathRelative = path.relative(APPDIR, filePath)
    console.log()
    log.info(`Compiling ${chalk.cyan(filePathRelative)}...`)
  })

  let isFirstCompile = true

  // Webpack has finished recompiling the bundle (whether or not you have warnings or errors)
  compiler.plugin('done', stats => {
    const messages = formatWebpackMessages(stats.toJson({}, true))
    const isSuccessful = messages.errors.length + messages.warnings.length === 0

    if (isSuccessful) {
      log.ok('Compiled successfully!')
      if (isFirstCompile) {
        onFirstReadyCallback()
        isFirstCompile = false
      }
    }

    if (messages.errors.length > 0) {
      log.err('Errors in compiling:')
      messages.errors.forEach(message => { console.log(listLine(chalk.red(message))) })
      return // Warnings are unuseful if there are errors
    }

    if (messages.warnings.length > 0) {
      log.warn('Compiled with warnings:')
      messages.warnings.forEach(message => { console.log(listLine(message, chalk.yellow)) })
    }
  })

  return compiler
}

function run(port) {
  const compiler = createWebpackCompiler(
    config,
    function onFirstSuccess() {
      log.info(`The app is running at: ${chalk.cyan(`http://${HOST}:${port}/`)}`)
    }
  )

  const devServer = new WebpackDevServer(compiler, devServerConfig)
  devServer.listen(port, err => {
    if (err) return log.err(err)
    log.info('Starting the development server...')
    openOrRefreshBrowser(`http://${HOST}:${port}/`)
  })
}

console.log(coloredBanner('/||||/| accurapp'))

detect(DEFAULT_PORT).then(port => {
  if (port === DEFAULT_PORT) {
    run(port)
  } else {
    if (isInteractive) {
      log.ok(`Something is already running on port ${DEFAULT_PORT}, switching to ${chalk.blue(port)}...`)
      run(port)
    } else {
      log.err(`Something is already running on port ${DEFAULT_PORT}, aborting.`)
    }
  }
  return port
}).catch(err => { throw err })
