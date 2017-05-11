process.on('unhandledRejection', err => { throw err })
process.env.NODE_ENV = 'development'
process.env.PUBLIC_URL = ''

require('dotenv').config({ silent: true })

const chalk = require('chalk')
const detect = require('detect-port')
const WebpackDevServer = require('webpack-dev-server')
const openOrRefreshBrowser = require('react-dev-utils/openBrowser')
const { log, createWebpackCompiler, coloredBanner } = require('./_utils')

const HOST = process.env.HOST || 'localhost'
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 8000

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

function runDevServer(port) {
  const compiler = createWebpackCompiler(() => {
    log.info(`The app is running at: ${chalk.cyan(`http://${HOST}:${port}/`)}`)
  })
  const devServer = new WebpackDevServer(compiler, devServerConfig)
  devServer.listen(port, err => {
    if (err) return log.err(err)
    log.info('Starting the development server...')
    openOrRefreshBrowser(`http://${HOST}:${port}/`)
  })
}

const isInteractive = process.stdout.isTTY

console.log(coloredBanner('/||||/| accurapp'))

detect(DEFAULT_PORT).then(port => {
  if (port === DEFAULT_PORT) {
    runDevServer(port)
  } else {
    if (isInteractive) {
      log.ok(`Something is already running on port ${DEFAULT_PORT}, switching to ${chalk.blue(port)}...`)
      runDevServer(port)
    } else {
      log.err(`Something is already running on port ${DEFAULT_PORT}, aborting.`)
    }
  }
  return port
}).catch(err => { throw err })
