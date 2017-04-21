#!/usr/bin/env node

// const fs = require('fs')
const fs = require('fs-extra')
const path = require('path')
const spawn = require('cross-spawn')
const chalk = require('chalk')
const meow = require('meow')

const dependencies = [
  'react',
  'react-dom',
  'd3',
  'lodash',
]

const devDependencies = [
  'accurapp-scripts',
  'webpack-preset-accurapp',
  'eslint-config-accurapp',
]

const log = {
  ok(...a) { console.log('--- ' + chalk.yellow(...a)) },
  err(...a) { console.error('!!! ' + chalk.red(...a)) },
  info(...a) { console.log('::: ' + chalk.blue(...a)) },
}

function abort(message, errno = 1) {
  console.error(`\n`)
  log.err(message)
  log.err(`Aborting.`)
  process.exit(1)
}

function writePackageJson(dir, contentJson) {
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(contentJson, null, 2))
}

function exec(command, dir) {
  if (!dir) throw new Error(`Function exec called without directory.`)

  const [executable, ...args] = Array.isArray(command) ? command : command.split(' ')
  const proc = spawn.sync(executable, args, {
    stdio: 'inherit',
    cwd: dir,
  })
  if (proc.status !== 0) abort(`Command '${chalk.cyan(command)}' failed with error: "${proc.error}"`)
  if (proc.signal !== null) abort(`Command '${chalk.cyan(command)}' exited with signal: "${proc.signal}"`)
}

const cli = meow(`
	Usage
	  ${chalk.green('$')} ${chalk.cyan('create-accurapp')} ${chalk.yellow('<app-name>')}

	Options
    -v | --version    = to print current version
    -g | --no-git     = do not run git init/commit
    -i | --no-install = do not run yarn install
    -d | --dry-run    = to fake it all
    -t | --testing    = [internal] create a version for testing, referencing
                        the local accurapp-scripts as a 'file:' dependency

	Example
	  ${chalk.green('$')} ${chalk.blue('create-accurapp mega-viz')}
`, {
  alias: {
    v: 'version',
    g: 'no-git',
    i: 'no-install',
    d: 'dry-run',
    t: 'testing',
  },
})

const isRealRun = !cli.flags.dryRun
const isYesGit = !cli.flags.noGit
const isYesInstall = !cli.flags.noInstall
const isTesting = cli.flags.testing

const appDir = path.resolve(cli.input[0])
const appName = path.basename(appDir)
const appTitle = appName.split('-').map(i => i.charAt(0).toUpperCase() + i.substr(1)).join(' ')

console.log(`\n`)
log.info(`Welcome to create-accurapp!`)

if (fs.existsSync(appDir)) abort(`The directory '${appName}' is already existing!`)

log.ok(`Creating a new app in ${chalk.magenta(appName)}`)
if (isRealRun) fs.mkdirSync(appDir)

log.ok(`Creating package.json`)
const packageJson = {
  name: appName,
  private: true,
  version: '0.1.0',
  scripts: {
    start: 'accurapp-scripts start',
  },
}
if (isRealRun) writePackageJson(appDir, packageJson)

function templateOverwriting(filePath, substitutions) {
  let content = fs.readFileSync(filePath, { encoding: 'utf-8' })
  substitutions.forEach(([find, subst]) => {
    content = content.replace(find, subst)
  })
  fs.writeFileSync(filePath, content)
}

log.ok(`Creating dir structure`)
if (isRealRun) {
  fs.copySync(path.join(__dirname, 'template'), appDir)
  fs.renameSync(path.join(appDir, 'gitignore'), path.join(appDir, '.gitignore'))

  const substitutions = [
    [/\{\{APP_NAME\}\}/g, appName],
    [/\{\{APP_TITLE\}\}/g, appTitle],
  ]
  templateOverwriting(path.join(appDir, 'src/index.html'), substitutions)
  templateOverwriting(path.join(appDir, 'README.md'), substitutions)
}

if (isYesInstall) {
  const devDependenciesToInstall = isTesting
    ? devDependencies.map(dep => `file:../packages/${dep}`)
    : devDependencies
  log.ok(`Installing dev packages: ${devDependenciesToInstall.map(d => chalk.cyan(d)).join(', ')}`)
  if (isRealRun) exec(`yarn add --dev --ignore-scripts ${devDependenciesToInstall.join(' ')}`, appDir)

  log.ok(`Installing packages: ${chalk.cyan(dependencies.join(', '))}`)
  if (isRealRun) exec(`yarn add --ignore-scripts ${dependencies.join(' ')}`, appDir)
} else {
  log.info(`Not running 'yarn add/install' because you chose so.`)
}

const isReadyGit = fs.existsSync(path.join(appDir, '.gitignore'))
if (isYesGit && isReadyGit) {
  log.ok(`Initializing git repo`)
  if (isRealRun) exec(`git init`, appDir)

  log.ok(`Creating first commit`)
  if (isRealRun) exec(`git add .`, appDir)
  if (isRealRun) exec(['git', 'commit', '-a', '-m', `💥 Bang! First commit\n\nApp bootstrapped with create-accurapp`], appDir)
} else {
  if (!isYesGit) log.info(`Not running 'git init/add/commit' because you chose so.`)
  if (!isReadyGit) log.info(`Not running 'git init/add/commit' because there is no '.gitignore' file.`)
}

log.ok(`Done! Have fun with your new app.`)
log.info(`Quick tip:\n
    ${chalk.cyan(`cd ${appName}`)}
    ${chalk.cyan(`yarn start`)}
`)
