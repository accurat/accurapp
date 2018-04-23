module.exports = function (context, opts = {}) {
  const env = process.env.BABEL_ENV || process.env.NODE_ENV
  const isDevelopment = env === 'development'

  return {
    presets: [
      // Browsers are taken from the browserslist field in package.json
      [require('@babel/preset-env').default, {
        modules: false,
        useBuiltIns: 'usage',
      }],
      [require('@babel/preset-react').default, {
        // Adds component stack to warning messages
        // Adds __self attribute to JSX which React will use for some warnings
        development: isDevelopment,
      }],
      require('@babel/preset-stage-0').default,
    ],
    plugins: [
      require('babel-plugin-lodash'),
      require('babel-plugin-macros'),
    ],
  }
}
