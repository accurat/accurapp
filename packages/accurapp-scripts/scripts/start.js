process.on('unhandledRejection', err => { throw err })
process.env.NODE_ENV = 'development'
process.env.PUBLIC_URL = ''

require('dotenv').config({ silent: true })

const chalk = require('chalk')
const detect = require('detect-port')
const WebpackDevServer = require('webpack-dev-server')
const openOrRefreshBrowser = require('react-dev-utils/openBrowser')
const { prepareUrls } = require('react-dev-utils/WebpackDevServerUtils')
const { log, createWebpackCompiler, readWebpackConfig, coloredBanner } = require('./_utils')

const HOST = process.env.HOST || '0.0.0.0'
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 8000

function runDevServer(port) {
  const urls = prepareUrls('http', HOST, port)
  const compiler = createWebpackCompiler(() => {
    log.info(`The app is running at: ${chalk.cyan(urls.localUrlForTerminal)}`)
    log.info(`Or on your network at: ${chalk.cyan(urls.lanUrlForTerminal)}`)
  })

  const devServerConfig = Object.assign({
    host: HOST,
    public: urls.lanUrlForConfig,
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
