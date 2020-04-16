module.exports = (context, opts = {}) => {
  const env = process.env.BABEL_ENV || process.env.NODE_ENV
  const isDevelopment = env === 'development'
  const isTest = env === 'test'
  const useTypescript = opts.typescript

  return {
    presets: [
      // Browsers are taken from the browserslist field in package.json
      [
        require('@babel/preset-env').default,
        isTest
          ? {
            targets: {
              node: 'current',
            },
          }
          : {
            modules: false,
            useBuiltIns: 'usage',
            // Enable stage 4 proposals, like array.flatMap
            shippedProposals: true,
            // Use new corejs version
            corejs: { version: 3, proposals: true },
          },
      ],
      [
        require('@babel/preset-react').default,
        {
          // Adds component stack to warning messages
          // Adds __self attribute to JSX which React will use for some warnings
          development: isDevelopment || isTest,
          // Will use the native built-in instead of trying to polyfill
          // behavior for any plugins that require one.
          useBuiltIns: true,
        },
      ],
      ...(useTypescript ? [require('@babel/preset-typescript').default] : []),
    ],
    plugins: [
      require('babel-plugin-lodash'),
      require('babel-plugin-macros'),

      // ----------- Stage 0 -----------
      require('@babel/plugin-proposal-function-bind').default,

      // ----------- Stage 1 -----------
      require('@babel/plugin-proposal-export-default-from').default,
      [require('@babel/plugin-proposal-pipeline-operator').default, { proposal: 'minimal' }],
      require('@babel/plugin-proposal-do-expressions').default,
      require('@babel/plugin-proposal-partial-application').default,

      // ----------- Stage 2 -----------
      // Use the default proposal when it will be finalized
      [require('@babel/plugin-proposal-decorators').default, { legacy: true }],
      require('@babel/plugin-proposal-function-sent').default,
      require('@babel/plugin-proposal-throw-expressions').default,
      [require('@babel/plugin-proposal-private-methods').default, { loose: true }],

      // ----------- Stage 3 -----------
      require('@babel/plugin-proposal-numeric-separator').default,
      require('@babel/plugin-syntax-import-meta').default,
      require('@babel/plugin-proposal-logical-assignment-operators').default,
      // Enable loose mode to use assignment instead of defineProperty
      // See discussion in https://github.com/facebook/create-react-app/issues/4263
      [require('@babel/plugin-proposal-class-properties').default, { loose: true }],

      // ----------- Stage 4 -----------
      require('@babel/plugin-proposal-json-strings').default,
      require('@babel/plugin-proposal-export-namespace-from').default,
      // Optional chaining and nullish coalescing are supported in @babel/preset-env,
      // but not yet supported in webpack due to support missing from acorn.
      // These can be removed once webpack has support.
      // See https://github.com/facebook/create-react-app/issues/8445#issuecomment-588512250
      require('@babel/plugin-proposal-optional-chaining').default,
      require('@babel/plugin-proposal-nullish-coalescing-operator').default,
    ],
  }
}
