module.exports = (browsers) => ({
  presets: [
    ['env', {
      targets: { browsers },
      modules: false,
      useBuiltIns: true,
    }],
    'stage-0',
    'react',
  ],
  plugins: [
    'transform-decorators-legacy',
  ],
})
