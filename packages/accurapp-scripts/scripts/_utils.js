const path = require('path')
const webpack = require('webpack')
const chalk = require('chalk')
const figlet = require('figlet')
const boxen = require('boxen')
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

function yellowBox(message) {
  const boxenOptions = {
    padding: 1,
    align: 'center',
    borderColor: 'yellow',
  }

  return boxen(message, boxenOptions)
}

function createOutdatedMessage(outdatedDeps, updatedDeps) {
  const outdatedMessages = outdatedDeps.map((dep, i) =>
    `${chalk.blue(dep.name)} ${chalk.gray(dep.version)} → ${chalk.green(updatedDeps[i].version)}`
  )

  return `
${chalk.yellow('Hey, an update for accurapp is available!')}
${outdatedMessages.join('\n')}
${chalk.yellow('Run')} ${chalk.cyan('yarn upgrade-interactive')} ${chalk.yellow('to update')}
`
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

function readWebpackConfig() {
  const cwd = process.cwd()
  return require(path.join(cwd, 'webpack.config.js'))
}

/*
 * The webpack "compiler" is a low-level interface to Webpack that lets us listen to
 * some events and provide our own custom messages.
 */
function createWebpackCompiler(onFirstReadyCallback = noop, onError = noop) {
  let compiler
  try {
    const config = readWebpackConfig()
    compiler = webpack(config)
  } catch (err) {
    log.err(`Failed to compile:\n${err.message || err}`)
    process.exit(1)
  }

  // You have changed a file, bundle is now "invalidated", and Webpack is recompiling a bundle
  compiler.plugin('invalid', (filePath) => {
    const filePathRelative = path.relative(process.cwd(), filePath)
    console.log()
    log.info(`Compiling ${chalk.cyan(filePathRelative)}...`)
  })

  let isFirstCompile = true

  // Webpack has finished recompiling the bundle (whether or not you have warnings or errors)
  compiler.plugin('done', (stats) => {
    const messages = formatWebpackMessages(stats.toJson({}, true))
    const isSuccessful = messages.errors.length + messages.warnings.length === 0

    if (isSuccessful) {
      log.ok('Compiled successfully!')
      if (isFirstCompile) {
        onFirstReadyCallback()
        isFirstCompile = false
      }
    } else if (messages.errors.length > 0) {
      log.err('Errors in compiling:')
      messages.errors.forEach(message => { console.log(listLine(message, chalk.red)) })
      onError()
    } else if (messages.warnings.length > 0) {
      log.warn('Compiled with warnings:')
      messages.warnings.forEach(message => { console.log(listLine(message, chalk.yellow)) })
    }
  })

  return compiler
}

module.exports = {
  log,
  noop,
  coloredBanner,
  yellowBox,
  createOutdatedMessage,
  indent,
  listLine,
  readWebpackConfig,
  createWebpackCompiler,
}
