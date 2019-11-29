require('dotenv').config() // gives precedence to the env variables already present
process.env.NODE_ENV = 'development'
process.env.PUBLIC_URL = ''
process.env.GENERATE_SOURCEMAP = 'true'
process.env.TRANSPILE_NODE_MODULES = process.env.TRANSPILE_NODE_MODULES || 'true'

const chalk = require('chalk')
const detect = require('detect-port')
const WebpackDevServer = require('webpack-dev-server')
const openOrRefreshBrowser = require('react-dev-utils/openBrowser')
const { prepareUrls } = require('react-dev-utils/WebpackDevServerUtils')
const { log, coloredBanner } = require('../utils/logging-utils')
const { tunnelPort, generateSubdomain } = require('../utils/tunnel-client')
const { createWebpackCompiler, readWebpackConfig } = require('../utils/webpack-utils')
const { verifyTypeScriptSetup } = require('../utils/verifyTypeScriptSetup')
const {
  extractBrowserslistString,
  extractLatestCommitHash,
  extractLatestCommitTimestamp,
  extractLatestTag,
} = require('../utils/git-utils')

process.env.BROWSERSLIST = extractBrowserslistString()
process.env.LATEST_COMMIT = extractLatestCommitHash()
process.env.LATEST_COMMIT_TIMESTAMP = extractLatestCommitTimestamp()
process.env.LATEST_TAG = extractLatestTag()

const HOST = process.env.HOST || '0.0.0.0'
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 8000
const PROTOCOL = process.env.HTTPS === 'true' ? 'https' : 'http'
const EXPOSED = process.argv.includes('--exposed')

const appDir = process.cwd()
verifyTypeScriptSetup(appDir)

function runDevServer(port) {
  const urls = prepareUrls(PROTOCOL, HOST, port)
  const compiler = createWebpackCompiler(() => {
    log.info(`The app is running at: ${chalk.cyan(urls.localUrlForTerminal)}`)
    log.info(`Or on your network at: ${chalk.cyan(urls.lanUrlForTerminal)}`)
  })

  const devServerConfig = {
    host: HOST,
    public: urls.lanUrlForConfig,
    https: PROTOCOL === 'https',
    ...readWebpackConfig().devServer,
  }
  const devServer = new WebpackDevServer(compiler, devServerConfig)
  devServer.listen(port, HOST, err => {
    if (err) return log.err(err)
    log.info('Starting the development server...')
    openOrRefreshBrowser(urls.localUrlForBrowser)
  })

  EXPOSED &&
    tunnelPort(port, generateSubdomain())
      .then(url => {
        log.info(`App exposed to the interwebs on: ${chalk.cyan(url)}`)
      })
      .catch(err => {
        log.err(err)
      })

  const shutDownServer = () => {
    devServer.close()
    process.exit()
  }
  process.on('SIGINT', shutDownServer)
  process.on('SIGTERM', shutDownServer)
}

console.log(coloredBanner('/||||/| accurapp'))

detect(DEFAULT_PORT)
  .then(port => {
    if (!port === DEFAULT_PORT) {
      log.ok(
        `Something is already running on port ${DEFAULT_PORT}, switching to ${chalk.blue(port)}...`
      )
    }
    runDevServer(port)
    return port
  })
  .catch(err => {
    throw err
  })
