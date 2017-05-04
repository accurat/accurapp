function errorToWarn(ruleValue) {
  if (ruleValue === 2 || ruleValue === 'error') {
    return 1
  }
  if (Array.isArray(ruleValue)) {
    if (ruleValue[0] === 2 || ruleValue[0] === 'error') {
      ruleValue[0] = 1
      return ruleValue
    }
  }
  return ruleValue
}

var standardJSRules = require('eslint-config-standard').rules
var standardJSRulesWarn = Object.keys(standardJSRules).reduce(function (acc, ruleName) {
  if (ruleName.indexOf('standard') === 0) return acc

  var ruleValue = standardJSRules[ruleName]
  var ruleValueNew = errorToWarn(ruleValue)
  if (ruleName.startsWith('node/')) return acc // filter out eslint-plugin-node rules because they error
  acc[ruleName] = ruleValueNew
  return acc
}, {})

module.exports = {
  root: true,

  parser: 'babel-eslint',

  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      generators: true,
      experimentalObjectRestSpread: true,
    },
  },

  plugins: [
    'import',
    'flowtype',
    'promise',
    'react',
  ],

  env: {
    es6: true,
    node: true,
  },

  globals: {
    document: false,
    navigator: false,
    window: false,
  },

  rules: Object.assign(standardJSRulesWarn, {
    // WARNINGS
    'comma-dangle': [1, 'always-multiline'], // No risks, beacuse it will be transpiled
    'space-before-function-paren': [1, { anonymous: 'always', named: 'never' }],
    'key-spacing': [1, { beforeColon: false, afterColon: true, mode: 'minimum' }],
    'object-curly-spacing': [1, 'always'],
    'block-spacing': [1, 'always'],
    'padded-blocks': [1, { blocks: 'never', switches: 'never', classes: 'never' }],
    'no-implicit-coercion': 1,
    'react/sort-comp': 1,
    'react/jsx-indent': [1, 2],
    'react/jsx-indent-props': [1, 2],
    'react/jsx-wrap-multilines': 1,
    'react/jsx-equals-spacing': [1, 'never'],
    'react/jsx-no-duplicate-props': [1, { ignoreCase: true }],
    'react/jsx-no-undef': 1,
    'react/jsx-pascal-case': [1, { allowAllCaps: true, ignore: [] }],
    'react/jsx-uses-react': 1,
    'react/jsx-uses-vars': 1,
    'react/no-danger-with-children': 1,
    'react/no-deprecated': 1,
    'react/no-direct-mutation-state': 1,
    'react/no-is-mounted': 1,
    'react/require-render-return': 1,
    'react/style-prop-object': 1,
    // ERRORS
    'no-redeclare': 2,
    'no-undef': 2,
    'no-unexpected-multiline': 2,
    'no-use-before-define': [2, { functions: false, classes: true, variables: true }],
    'callback-return': [2, ['callback', 'cb', 'next', 'done']],
    'handle-callback-err': 2,
    'react/no-unused-prop-types': 2,
    'react/jsx-no-bind': [2, { ignoreRefs: true }],
    'react/react-in-jsx-scope': 2,
    'promise/catch-or-return': 2,
    'promise/always-return': 2,
    'promise/no-return-wrap': 2,
    'promise/no-nesting': 2,
  }),
}
