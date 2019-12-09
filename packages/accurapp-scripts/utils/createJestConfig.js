const paths = require('../../config/paths')
const modules = require('../../config/modules')

module.exports = (resolve, rootDir, isEjecting) => {
  // Use this instead of `paths.testsSetup` to avoid putting
  // an absolute filename into configuration after ejecting.

  return {

    rootDir,

    setupFiles: [
      'react-app-polyfill/jsdom',
    ],
    setupFilesAfterEnv: [setupTestsFile],
    testEnvironment: 'jest-environment-jsdom-fourteen',

    transform: {
      '^.+\\.(js|jsx|ts|tsx)$': isEjecting
        ? '<rootDir>/node_modules/babel-jest'
        : resolve('config/jest/babelTransform.js'),
      '^.+\\.css$': resolve('config/jest/cssTransform.js'),
      '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': resolve(
        'config/jest/fileTransform.js'
      ),
    },
    transformIgnorePatterns: [
      '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|ts|tsx)$',
      '^.+\\.module\\.(css|sass|scss)$',
    ],
    modulePaths: modules.additionalModulePaths || [],
    moduleNameMapper: {
      '^react-native$': 'react-native-web',
      '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    },
    moduleFileExtensions: [...paths.moduleFileExtensions, 'node'].filter(
      ext => !ext.includes('mjs')
    ),

    watchPlugins: [
      'jest-watch-typeahead/filename',
      'jest-watch-typeahead/testname',
    ],
  }
}
