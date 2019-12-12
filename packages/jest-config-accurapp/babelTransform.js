const fs = require('fs')
const babelJest = require('babel-jest')

const appDir = process.cwd()
const useTypescript = fs.existsSync(`${appDir}/tsconfig.json`)
const babelrc = JSON.parse(fs.readFileSync(`${appDir}/.babelrc`))

// Inject the typescript option
if (useTypescript) {
  babelrc.presets = [
    ...babelrc.presets.filter(p => p !== 'accurapp'),
    ['accurapp', { typescript: true }],
  ]
}

module.exports = babelJest.createTransformer({
  ...babelrc,
  babelrc: false,
  configFile: false,
})
