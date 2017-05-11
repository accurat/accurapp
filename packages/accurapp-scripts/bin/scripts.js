#!/usr/bin/env node
if (parseFloat(process.versions.node) < 6.5) throw new Error('Sorry, Node 6.5+ is required! Tip: use `nvm` for painless upgrades.')

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
