function errorToWarn(ruleValue) {
  if (ruleValue === 2 || ruleValue === 'error') {
    return 'warn'
  }
  if (Array.isArray(ruleValue)) {
    if (ruleValue[0] === 2 || ruleValue[0] === 'error') {
      ruleValue[0] = 'warn'
      return ruleValue
    }
  }
  return ruleValue
}

const standardJSRules = require('eslint-config-standard').rules
const standardJSRulesWarn = Object.keys(standardJSRules).reduce(function (acc, ruleName) {
  if (ruleName.indexOf('standard') === 0) return acc

  const ruleValue = standardJSRules[ruleName]
  const ruleValueNew = errorToWarn(ruleValue)
  if (ruleName.startsWith('node/')) return acc // filter out eslint-plugin-node rules because they error
  acc[ruleName] = ruleValueNew
  return acc
}, {})

module.exports = {
  root: true,

  parser: 'babel-eslint',

  parserOptions: {
    ecmaVersion: 9,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      generators: true,
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
    'comma-dangle': ['warn', 'always-multiline'], // No risks, beacuse it will be transpiled
    'space-before-function-paren': ['warn', { anonymous: 'always', named: 'never' }],
    'key-spacing': ['warn', { beforeColon: false, afterColon: true, mode: 'minimum' }],
    'object-curly-spacing': ['warn', 'always'],
    'block-spacing': ['warn', 'always'],
    'padded-blocks': ['warn', { blocks: 'never', switches: 'never', classes: 'never' }],
    'no-implicit-coercion': 'warn',
    'react/sort-comp': 'warn',
    'react/jsx-indent': ['warn', 2],
    'react/jsx-indent-props': ['warn', 2],
    'react/jsx-wrap-multilines': 'warn',
    'react/jsx-equals-spacing': ['warn', 'never'],
    'react/jsx-no-duplicate-props': ['warn', { ignoreCase: true }],
    'react/jsx-no-undef': 'warn',
    'react/jsx-pascal-case': ['warn', { allowAllCaps: true, ignore: [] }],
    'react/jsx-uses-react': 'warn',
    'react/jsx-uses-vars': 'warn',
    'react/no-danger-with-children': 'warn',
    'react/no-deprecated': 'warn',
    'react/no-direct-mutation-state': 'warn',
    'react/no-is-mounted': 'warn',
    'react/require-render-return': 'warn',
    'react/style-prop-object': 'warn',
    'promise/catch-or-return': 'warn',
    'promise/no-callback-in-promise': 'warn',
    'promise/no-return-wrap': 'warn',
    // ERRORS
    'no-redeclare': 'error',
    'no-undef': 'error',
    'no-unexpected-multiline': 'error',
    'no-use-before-define': ['error', { functions: false, classes: true, variables: true }],
    'callback-return': ['error', ['callback', 'cb', 'next', 'done']],
    'handle-callback-err': 'error',
    'react/no-unused-prop-types': 'error',
    'react/jsx-no-bind': ['error', { ignoreRefs: true }],
    'react/react-in-jsx-scope': 'error',
    'promise/no-nesting': 'error',
  }),
}
