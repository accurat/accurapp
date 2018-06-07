process.env.NODE_ENV = 'development'
process.env.PUBLIC_URL = ''
process.env.TRANSPILE_NODE_MODULES = process.env.TRANSPILE_NODE_MODULES || 'true'
process.env.GENERATE_SOURCEMAP = 'true'
require('dotenv').config() // gives precedence to the env variables already present

const chalk = require('chalk')
const detect = require('detect-port')
const WebpackDevServer = require('webpack-dev-server')
const openOrRefreshBrowser = require('react-dev-utils/openBrowser')
const { prepareUrls } = require('react-dev-utils/WebpackDevServerUtils')
const { log, createWebpackCompiler, readWebpackConfig, coloredBanner, extractBrowserslistString, extractLatestCommitHash, extractLatestCommitTimestamp } = require('./_utils')

process.env.BROWSERSLIST = extractBrowserslistString()
process.env.LATEST_COMMIT = extractLatestCommitHash()
process.env.LATEST_COMMIT_TIMESTAMP = extractLatestCommitTimestamp()

const HOST = process.env.HOST || '0.0.0.0'
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 8000
const PROTOCOL = process.env.HTTPS === 'true' ? 'https' : 'http'

function runDevServer(port) {
  const urls = prepareUrls(PROTOCOL, HOST, port)
  const compiler = createWebpackCompiler(() => {
    log.info(`The app is running at: ${chalk.cyan(urls.localUrlForTerminal)}`)
    log.info(`Or on your network at: ${chalk.cyan(urls.lanUrlForTerminal)}`)
  })

  const devServerConfig = Object.assign({
    host: HOST,
    public: urls.lanUrlForConfig,
    https: PROTOCOL === 'https',
  }, readWebpackConfig().devServer)
  const devServer = new WebpackDevServer(compiler, devServerConfig)
  devServer.listen(port, HOST, err => {
    if (err) return log.err(err)
    log.info('Starting the development server...')
    openOrRefreshBrowser(urls.localUrlForBrowser)
  })

  const shutDownServer = () => {
    devServer.close()
    process.exit()
  }
  process.on('SIGINT', shutDownServer)
  process.on('SIGTERM', shutDownServer)
}

console.log(coloredBanner('/||||/| accurapp'))

detect(DEFAULT_PORT).then(port => {
  if (port === DEFAULT_PORT) {
    runDevServer(port)
  } else {
    log.ok(`Something is already running on port ${DEFAULT_PORT}, switching to ${chalk.blue(port)}...`)
    runDevServer(port)
  }
  return port
}).catch(err => { throw err })
