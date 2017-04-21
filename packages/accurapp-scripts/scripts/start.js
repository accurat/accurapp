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

function noop() {}

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
    console.log(chalk.red(`Failed to compile:\n${err.message || err}`))
    process.exit(1)
  }

  // "invalid" event (= bundle invalidation) fires when you have changed a file, and Webpack is recompiling a bundle.
  compiler.plugin('invalid', (filePath) => {
    const filePathRelative = path.relative(APPDIR, filePath)
    console.log(chalk.green(`Compiling ${chalk.cyan(filePathRelative)}...`))
  })

  let isFirstCompile = true

  // "done" event fires when Webpack has finished recompiling the bundle, whether or not you have warnings or errors.
  compiler.plugin('done', stats => {
    const messages = formatWebpackMessages(stats.toJson({}, true))
    const isSuccessful = messages.errors.length + messages.warnings.length === 0

    if (isSuccessful) {
      console.log(chalk.green('Compiled successfully!'))
      if (isFirstCompile) {
        onFirstReadyCallback()
        isFirstCompile = false
      }
    }

    if (messages.errors.length > 0) {
      console.log(chalk.red('Errors in compiling:'))
      messages.errors.forEach(message => { console.log(' - ', chalk.red(message)) })
      return // Warnings are unuseful if there are errors
    }

    if (messages.warnings.length > 0) {
      console.log(chalk.yellow('Compiled with warnings:'))
      messages.warnings.forEach(message => { console.log(' - ', chalk.yellow(message)) })
    }
  })

  return compiler
}

function run(port) {
  const compiler = createWebpackCompiler(
    config,
    function onFirstSuccess() {
      console.log(chalk.blue(`The app is running at: ${chalk.cyan(`http://${HOST}:${port}/`)}`))
    }
  )

  const devServer = new WebpackDevServer(compiler, devServerConfig)
  devServer.listen(port, err => {
    if (err) return console.log(err)
    console.log(chalk.blue('Starting the development server...'))
    openOrRefreshBrowser(`http://${HOST}:${port}/`)
  })
}

const bannerText = '/llll/l accurapp' // 'l' (lowercase L) are much nicer than '|' (pipes) in BigMoney font
const bannerColors = { '_': 'red', '|': 'red', '\\': 'red', '/': 'red', '$': 'blue' }
const banner = figlet.textSync(bannerText, { font: 'Big Money-nw' })
const coloredBanner = banner.replace(/[^\s]/g, (c) => chalk[bannerColors[c] || 'white'](c))
console.log(`\n` + coloredBanner + `\n`)

detect(DEFAULT_PORT).then(port => {
  if (port === DEFAULT_PORT) {
    run(port)
  } else {
    if (isInteractive) {
      console.log(chalk.yellow(`Something is already running on port ${DEFAULT_PORT}, switching to ${chalk.blue(port)}...`))
      run(port)
    } else {
      console.log(chalk.red(`Something is already running on port ${DEFAULT_PORT}, aborting.`))
    }
  }
})
