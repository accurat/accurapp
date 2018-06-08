const cp = require('child_process')

const args = process.argv.slice(2)
const eslint = require.resolve('eslint/bin/eslint')

cp.execSync(`${eslint} --cache ${args.join(' ')} src/`, { stdio: 'inherit' })
