#!/usr/bin/env node
if (parseFloat(process.versions.node) < 7) throw new Error('Sorry, Node 7+ is required! Tip: use `nvm` for painless upgrades.')

// warn if any accurapp package is outdated
if (!process.env.CI) {
  const latestVersion = require('latest-version')
  const semver = require('semver')
  const { createOutdatedMessage, yellowBox } = require('../scripts/_utils')

  const currentDeps = [
    require('../package.json'),
    require('../../eslint-config-accurapp/package.json'),
    require('../../webpack-preset-accurapp/package.json'),
  ]

  Promise.all(currentDeps.map((dep) => latestVersion(dep.name)))
    .then((npmVersions) => {
      const latestDeps = npmVersions.map((version, i) => Object.assign({}, currentDeps[i], { version }))
      const outdatedDeps = currentDeps.filter((dep, i) => semver.lt(dep.version, latestDeps[i].version))

      if (outdatedDeps.length > 0) {
        const message = createOutdatedMessage(outdatedDeps, latestDeps)
        console.log(yellowBox(message))
      }
    })
}

// start the designated script
const script = process.argv[2]
const scriptPath = '../scripts/' + script

try {
  require.resolve(scriptPath) // Check if exists without running
} catch (err) {
  if (err.code === 'MODULE_NOT_FOUND') {
    console.error(`Unknown script "${script}".`)
  } else {
    console.error(err)
  }
  process.exit(1)
}

require(scriptPath) // Run the script actually
