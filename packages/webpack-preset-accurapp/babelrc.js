module.exports = (browsers) => ({
  presets: [
    ['env', {
      targets: { browsers },
      modules: false,
    }],
    'stage-0',
    'react',
  ],
  plugins: [
    'transform-decorators-legacy',
  ],
})
