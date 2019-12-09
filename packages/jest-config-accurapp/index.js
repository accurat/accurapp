// TODO https://github.com/facebook/create-react-app/tree/master/packages/react-scripts/config/jest

module.exports = {
  testEnvironment: 'jest-environment-jsdom-fifteen',

  // TODO is this necessary?
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': '<rootDir>/node_modules/babel-jest',
  },

  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
}
