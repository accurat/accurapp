const path = require('path')
const fs = require('fs')
const cp = require('child_process')
const webpack = require('webpack')
const chalk = require('chalk')
const figlet = require('figlet')
const boxen = require('boxen')
const outdent = require('outdent')
const filesize = require('filesize')
const gzipSize = require('gzip-size').sync
const indentString = require('indent-string')
const columnify = require('columnify')
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages')
const prettyMs = require('pretty-ms')
const browserslist = require('browserslist')

const log = {
  ok(...a) { console.log(`::: ${chalk.yellow(...a)}`) },
  warn(...a) { console.error(`!!! ${chalk.yellow(...a)}`) },
  err(...a) { console.error(`!!! ${chalk.red(...a)}`) },
  info(...a) { console.log(`--- ${chalk.blue(...a)}`) },
}

function noop() {}

function coloredBanner(text, colors = ['blue', 'red']) {
  // If the console is small, we show only the logo
  if (text.includes(' accurapp') && process.stdout.columns < 125) {
    text = text.slice(0, -' accurapp'.length)
  }

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

function createOutdatedMessage(outdatedDeps, latestDeps) {
  const outdatedMessages = outdatedDeps.map((dep, i) => {
    const updatedDep = latestDeps.find(latestDep => latestDep.name === dep.name)
    return `${chalk.blue(dep.name)} ${chalk.gray(dep.version)} → ${chalk.green(updatedDep.version)}`
  })

  return outdent`
    ${chalk.yellow('Hey, an update for accurapp is available!')}
    ${outdatedMessages.join('\n')}
    ${chalk.yellow('Run')} ${chalk.cyan('yarn upgrade-interactive --latest')} ${chalk.yellow('to update')}
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
  compiler.hooks.invalid.tap('invalid', (filePath) => {
    const filePathRelative = path.relative(process.cwd(), filePath)
    console.log()
    log.info(`Compiling ${chalk.cyan(filePathRelative)}...`)
  })

  let isFirstCompile = true

  // Webpack has finished recompiling the bundle (whether or not you have warnings or errors)
  compiler.hooks.done.tap('done', (stats) => {
    const statsJson = stats.toJson({})
    const messages = formatWebpackMessages(statsJson)
    const time = prettyMs(statsJson.time)
    const isSuccessful = messages.errors.length + messages.warnings.length === 0

    if (isSuccessful) {
      log.ok(`Compiled successfully in ${chalk.cyan(time)}!`)
      if (isFirstCompile) {
        onFirstReadyCallback()
        isFirstCompile = false
      }
    } else if (messages.errors.length > 0) {
      log.err('Errors in compiling:')
      // Only log the first error. Others are often indicative
      // of the same problem, but confuse the reader with noise
      console.log(listLine(messages.errors[0], chalk.red))
      onError()
    } else if (messages.warnings.length > 0) {
      log.warn(`Compiled in ${chalk.cyan(time)} with warnings:`)
      messages.warnings.forEach(message => { console.log(listLine(message, chalk.yellow)) })
    }
  })

  return compiler
}

function printFileSizes(webpackStats, appBuild, maxBundleGzipSize = 512 * 1024) {
  const assets = (webpackStats.stats || [webpackStats])
    .map(stats =>
      stats
        .toJson()
        .assets.filter(asset => /\.(js|css)$/.test(asset.name))
        .map(asset => {
          const fileContents = fs.readFileSync(path.join(appBuild, asset.name))
          const size = fs.statSync(path.join(appBuild, asset.name)).size
          const sizeGzip = gzipSize(fileContents)

          return {
            folder: path.join(path.basename(appBuild), path.dirname(asset.name)),
            name: path.basename(asset.name),
            size,
            sizeGzip,
          }
        })
    )
    .reduce((single, all) => all.concat(single), [])

  assets.sort((a, b) => b.size - a.size)

  const isLarge = asset => path.extname(asset.name) === '.js' && asset.size > maxBundleGzipSize

  const columnData = assets.reduce((columnObj, asset) => {
    const sizeLabel = `${filesize(asset.size)} ${chalk.dim(`(${filesize(asset.sizeGzip)} gzipped)`)}`
    const firstColumn = isLarge(asset) ? chalk.yellow(sizeLabel) : sizeLabel
    const secondColumn = `${chalk.dim(`${asset.folder}${path.sep}`)}${chalk.cyan(asset.name)}`

    columnObj[firstColumn] = secondColumn
    return columnObj
  }, {})

  console.log(
    indentString(
      columnify(columnData, {
        showHeaders: false,
        columnSplitter: '   ',
      }),
      3
    )
  )

  if (assets.some(isLarge)) {
    console.log()
    console.log(chalk.yellow(outdent`
      The bundle size is significantly larger than recommended.
      Consider reducing it with code splitting: https://goo.gl/9VhYWB
      You can also analyze the project dependencies: https://goo.gl/sDmR4n
    `))
  }
}

function extractBrowserslistString() {
  const appDir = process.cwd()
  const browsersListConfig = browserslist.loadConfig({ path: appDir })
  return Array.isArray(browsersListConfig) ? browsersListConfig.join(', ') : browsersListConfig
}

function extractLatestCommitHash() {
  try {
    return cp.execSync('git log -n1 --format=format:"%h"')
  } catch (e) {
    // Probably git is not available, return an empty string instead
    return ''
  }
}

function extractLatestCommitTimestamp() {
  try {
    const unixTimestamp = cp.execSync('git log -n1 --format=format:"%ct"')
    const utcTimestamp = `${unixTimestamp}000`
    return utcTimestamp
  } catch (e) {
    // Probably git is not available, return time of the build instead
    return Date.now()
  }
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
  printFileSizes,
  extractBrowserslistString,
  extractLatestCommitHash,
  extractLatestCommitTimestamp,
}
