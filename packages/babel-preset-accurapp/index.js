module.exports = (context, opts = {}) => {
  const env = process.env.BABEL_ENV || process.env.NODE_ENV
  const isDevelopment = env === 'development'

  return {
    presets: [
      // Browsers are taken from the browserslist field in package.json
      [
        require('@babel/preset-env').default,
        {
          modules: false,
          useBuiltIns: 'usage',
          // Enable stage 4 proposals, like object rest/spread
          shippedProposals: true,
        },
      ],
      [
        require('@babel/preset-react').default,
        {
          // Adds component stack to warning messages
          // Adds __self attribute to JSX which React will use for some warnings
          development: isDevelopment,
          // Will use the native built-in instead of trying to polyfill
          // behavior for any plugins that require one.
          useBuiltIns: true,
        },
      ],
    ],
    plugins: [
      require('babel-plugin-lodash'),
      require('babel-plugin-macros'),

      // ----------- Stage 0 -----------
      require('@babel/plugin-proposal-function-bind').default,

      // ----------- Stage 1 -----------
      require('@babel/plugin-proposal-export-default-from').default,
      require('@babel/plugin-proposal-logical-assignment-operators').default,
      require('@babel/plugin-proposal-optional-chaining').default,
      // The minimal proposal doesn't support await
      // Switch to the newer proposal when it will be supported
      [require('@babel/plugin-proposal-pipeline-operator').default, { proposal: 'smart' }],
      require('@babel/plugin-proposal-nullish-coalescing-operator').default,
      require('@babel/plugin-proposal-do-expressions').default,

      // ----------- Stage 2 -----------
      // Use the default proposal when it will be finalized
      [require('@babel/plugin-proposal-decorators').default, { legacy: true }],
      require('@babel/plugin-proposal-function-sent').default,
      require('@babel/plugin-proposal-export-namespace-from').default,
      require('@babel/plugin-proposal-numeric-separator').default,
      require('@babel/plugin-proposal-throw-expressions').default,

      // ----------- Stage 3 -----------
      require('@babel/plugin-syntax-dynamic-import').default,
      require('@babel/plugin-syntax-import-meta').default,
      // Enable loose mode to use assignment instead of defineProperty
      // See discussion in https://github.com/facebook/create-react-app/issues/4263
      [require('@babel/plugin-proposal-class-properties').default, { loose: true }],
      require('@babel/plugin-proposal-json-strings').default,
    ],
  }
}
