#!/usr/bin/env node
const semver = require('semver')
if (semver.lt(process.versions.node, '8.6.0')) {
  throw new Error('Sorry, Node 8.6+ is required! Tip: use `nvm` for painless upgrades.')
}

// Makes the script crash on unhandled rejections instead of silently ignoring them
process.on('unhandledRejection', err => {
  throw err
})

// Warn if any accurapp package is outdated
if (!process.env.CI) {
  const latestVersion = require('latest-version')
  const { createOutdatedMessage, yellowBox } = require('../scripts/_utils')

  const currentDeps = [
    require('../package.json'),
    require('../../babel-preset-accurapp/package.json'),
    require('../../eslint-config-accurapp/package.json'),
    require('../../webpack-preset-accurapp/package.json'),
  ]

  Promise.all(currentDeps.map(dep => latestVersion(dep.name)))
    .then(npmVersions => {
      const latestDeps = npmVersions.map((version, i) => ({ ...currentDeps[i], version }))
      const outdatedDeps = currentDeps.filter((dep, i) =>
        semver.lt(dep.version, latestDeps[i].version),
      )

      if (outdatedDeps.length > 0) {
        const message = createOutdatedMessage(outdatedDeps, latestDeps)
        console.log(yellowBox(message))
      }
    })
    .catch(() => {
      // Promise failed probably because there's no internet, do nothing
    })
}

// Start the designated script
const script = process.argv[2]
const scriptPath = `../scripts/${script}`

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
