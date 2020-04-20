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
const { tunnelPort } = require('ssh-tuna')
const { log, coloredBanner } = require('../utils/logging-utils')
const { generateSubdomain } = require('../utils/tunnel-utils')
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
const TUNNEL_DOMAIN = process.env.TUNNEL_DOMAIN || 'internal.accurat.io'
const TUNNEL_SSH_PORT = process.env.TUNNEL_SSH_PORT || 2222
const EXPOSED = process.argv.includes('--exposed')

const appDir = process.cwd()
verifyTypeScriptSetup(appDir)

function runDevServer(port) {
  const urls = prepareUrls(PROTOCOL, HOST, port)
  const compiler = createWebpackCompiler(() => {
    log.info(`The app is running at: ${chalk.cyan(urls.localUrlForTerminal)}`)
    log.info(`Or on your network at: ${chalk.cyan(urls.lanUrlForTerminal)}`)

    if (EXPOSED) {
      const subdomain = generateSubdomain()
      tunnelPort(port, subdomain, TUNNEL_DOMAIN, TUNNEL_SSH_PORT)
        .then(() => {
          const url = `https://${subdomain}.${TUNNEL_DOMAIN}`
          log.info(`Even from far away at: ${chalk.cyan(url)}`)
        })
        .catch((err) => {
          const message = err.message || err
          if (message.includes('authentication methods failed')) {
            err =
              'Could not authenticate to the tunneling server, please make sure you can access the server via ssh.'
          }

          log.err(`Could not expose the local port: ${err}`)
        })
    }
  })

  const devServerConfig = {
    host: HOST,
    public: urls.lanUrlForConfig,
    https: PROTOCOL === 'https',
    ...readWebpackConfig().devServer,
  }
  const devServer = new WebpackDevServer(compiler, devServerConfig)
  devServer.listen(port, HOST, (err) => {
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

detect(DEFAULT_PORT)
  .then((port) => {
    if (port !== DEFAULT_PORT) {
      log.ok(
        `Something is already running on port ${DEFAULT_PORT}, switching to ${chalk.blue(port)}...`
      )
    }
    runDevServer(port)
    return port
  })
  .catch((err) => {
    throw err
  })
