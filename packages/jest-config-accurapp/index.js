module.exports = {
  // Use newer version of jsdom
  testEnvironment: 'jest-environment-jsdom-fifteen',

  setupFiles: [
    // It contains some polyfills such as the isomorphic fetch
    'react-app-polyfill/jsdom',
    'jest-config-accurapp/setup',
  ],

  transform: {
    // Wrapper around babel-jest
    '\\.(js|jsx|ts|tsx)$': 'jest-config-accurapp/babelTransform',

    // Transform simple css files in an empty object
    // https://jestjs.io/docs/en/webpack.html
    '\\.css$': 'react-scripts/config/jest/cssTransform',

    // Transform all other files into just the filename string
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': 'react-scripts/config/jest/fileTransform',
  },

  // Don't transform css modules into an empty object
  transformIgnorePatterns: [
    '\\.module\\.(css)$',
  ],

  // Instead use identity-obj-proxy which outputs the classnames
  moduleNameMapper: {
    '\\.module\\.(css)$': 'identity-obj-proxy',
  },

  watchPlugins: [
    // Filter your tests by file name or test name
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
}
