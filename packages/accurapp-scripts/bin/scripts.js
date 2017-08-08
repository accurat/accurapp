#!/usr/bin/env node
if (parseFloat(process.versions.node) < 6.5) throw new Error('Sorry, Node 6.5+ is required! Tip: use `nvm` for painless upgrades.')

// warn if any accurapp package is outdated
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
    const updatedDeps = npmVersions.map((version, i) => Object.assign({}, currentDeps[i], { version }))
    const outdatedDeps = currentDeps.filter((dep, i) => semver.lt(dep.version, updatedDeps[i].version))

    if (outdatedDeps.length > 0) {
      const message = createOutdatedMessage(outdatedDeps, updatedDeps)
      console.log(yellowBox(message))
    }
  })

// start the designated script
const script = process.argv[2]
try {
  require('../scripts/' + script)
} catch (err) {
  if (err.code === 'MODULE_NOT_FOUND') {
    console.error(`Unknown script "${script}".`)
  } else {
    console.error(err)
  }
  process.exit(1)
}
