#!/usr/bin/env node
const path = require('path')
const semver = require('semver')
const chalk = require('chalk')
const fs = require('fs-extra')
const meow = require('meow')
const indentString = require('indent-string')
const { coloredBanner, log, exec, abort } = require('accurapp-scripts/utils/logging-utils')
const { verifyTypeScriptSetup } = require('accurapp-scripts/utils/verifyTypeScriptSetup')

if (semver.lt(process.versions.node, '10.0.0')) {
  console.log()
  log.err(`You are running Node ${process.versions.node}.`)
  log.err(`Accurapp requires Node 10 or higher.`)
  log.err(`Please upgrade your Node version.`)
  log.err(`Aborting.`)
  process.exit(1)
}

const cli = meow({
  description: false,
  help: `
    ${indentString(coloredBanner('/||||/| accurapp', ['red', 'magenta']), 4)}
    Usage
      ${chalk.green('$')} ${chalk.cyan('create-accurapp')} ${chalk.yellow('<app-name>')}

    Creates a folder named ${chalk.yellow('<app-name>')}, with a flexible JS build configuration.

    Options
      --version     = to print current version
      --no-git      = do not run git init && git commit
      --no-install  = do not run yarn install
      --typescript  = to use typescript
      --testing     = [internal] create a version for testing

    Example
      ${chalk.green('$')} ${chalk.cyan('create-accurapp mega-viz --no-install')}
  `,
  flags: {
    version: {
      alias: 'v',
    },
    git: {
      type: 'boolean',
      default: true,
    },
    install: {
      type: 'boolean',
      default: true,
    },
    typescript: {
      type: 'boolean',
    },
    testing: {
      type: 'boolean',
    },
  },
})

const shouldInitGit = cli.flags.git
const shouldInstall = cli.flags.install
const isTesting = cli.flags.testing
const useTypescript = cli.flags.typescript

if (cli.input.length === 0 && !cli.flags.help) {
  log.err(`No <app-name> specified! Displaying help.`)
  cli.showHelp(1)
}

const appDir = path.resolve(cli.input[0])
const appName = path.basename(appDir)
const appTitle = appName
  .split('-')
  .map((i) => i.charAt(0).toUpperCase() + i.slice(1))
  .join(' ')

console.log(coloredBanner('/||||/| accurapp', ['yellow', 'green']))

if (fs.existsSync(appDir)) abort(`The directory '${appName}' is already existing!`)

log.ok(`Creating a new app in ${chalk.magenta(appName)}`)
fs.mkdirSync(appDir)

log.ok(`Creating package.json`)
const packageJson = {
  name: appName,
  private: true,
  version: '0.1.0',
  license: 'MIT',
  scripts: {
    start: 'yarn && accurapp-scripts start',
    build: 'accurapp-scripts build',
    test: 'accurapp-scripts test',
    lint: 'accurapp-scripts lint',
    prettier: 'accurapp-scripts prettier',
  },
  browserslist: {
    production: ['>0.25%', 'not ie 11', 'not op_mini all'],
    development: ['last 1 Chrome version', 'last 1 Firefox version', 'last 1 Safari version'],
  },
}
fs.writeFileSync(path.resolve(appDir, 'package.json'), JSON.stringify(packageJson, null, 2))

function templateOverwriting(filePath, substitutions) {
  let content = fs.readFileSync(filePath, { encoding: 'utf-8' })
  substitutions.forEach(([find, subst]) => {
    content = content.replace(find, subst)
  })
  fs.writeFileSync(filePath, content)
}

log.ok(`Creating dir structure`)
fs.copySync(path.resolve(__dirname, 'template'), appDir)
fs.renameSync(path.resolve(appDir, 'gitignore'), path.resolve(appDir, '.gitignore'))

const substitutions = [
  [/\{\{APP_NAME\}\}/g, appName],
  [/\{\{APP_TITLE\}\}/g, appTitle],
]
templateOverwriting(path.resolve(appDir, 'src/index.html'), substitutions)
templateOverwriting(path.resolve(appDir, 'README.md'), substitutions)

if (shouldInstall) {
  const dependencies = [
    'd3',
    'react',
    'react-dom',
    'lodash-es',
    'modern-normalize',
    '@accurat/tachyons-lite',
    'tachyons-extra',
    ...(useTypescript ? ['@types/d3', '@types/react', '@types/react-dom', '@types/lodash-es'] : []),
  ]

  let devDependencies = [
    'accurapp-scripts',
    'babel-preset-accurapp',
    'eslint-config-accurapp',
    'jest-config-accurapp',
    'webpack-preset-accurapp',
    ...(useTypescript ? ['typescript', '@types/node', '@types/webpack-env', '@types/jest'] : []),
  ]

  // Require local package if we're testing.
  if (isTesting) {
    devDependencies = devDependencies.map((dep) =>
      dep.includes('accurapp') ? path.resolve(__dirname, `../${dep}`) : dep
    )
  }

  log.ok(`Installing dev dependencies: ${devDependencies.map((d) => chalk.cyan(d)).join(', ')}`)
  exec(`yarn add --dev ${devDependencies.join(' ')}`, appDir)

  log.ok(`Installing dependencies: ${dependencies.map((d) => chalk.cyan(d)).join(', ')}`)
  exec(`yarn add ${dependencies.join(' ')}`, appDir)
} else {
  log.info(`Not running 'yarn add/install' because you chose so.`)
}

if (useTypescript) {
  fs.renameSync(path.resolve(appDir, 'src/index.js'), path.resolve(appDir, 'src/index.tsx'))
  fs.renameSync(
    path.resolve(appDir, 'src/components/App.js'),
    path.resolve(appDir, 'src/components/App.tsx')
  )
  verifyTypeScriptSetup(appDir, { shouldInstall })
}

const isReadyGit = fs.existsSync(path.resolve(appDir, '.gitignore'))
if (shouldInitGit && isReadyGit) {
  log.ok(`Initializing git repo`)
  exec(`git init`, appDir)

  log.ok(`Creating first commit`)
  exec(`git add -A`, appDir)
  exec(
    ['git', 'commit', '-m', `💥 Bang! First commit\n\nApp bootstrapped with create-accurapp`],
    appDir
  )
} else {
  if (!shouldInitGit) log.info(`Not running 'git init/add/commit' because you chose so.`)
  if (!isReadyGit) {
    log.info(`Not running 'git init/add/commit' because there is no '.gitignore' file.`)
  }
}

log.ok(`Creating your local .env file`)

const envPath = path.resolve(appDir, '.env')
const envExamplePath = path.resolve(appDir, '.env.example')

if (!fs.existsSync(envPath)) {
  fs.copySync(envExamplePath, envPath)
}

console.log()
log.ok(`Done! Have fun with your new app.`)
log.info(`Quick tip:

    ${chalk.cyan(`cd ${appName}/`)}
    ${chalk.cyan(`yarn start`)}
`)
