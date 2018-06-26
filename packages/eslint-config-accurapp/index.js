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
  acc[ruleName] = ruleValueNew
  return acc
}, {})

module.exports = {
  root: true,

  parser: 'babel-eslint',

  parserOptions: {
    ecmaVersion: 2018,
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
    'no-copy-paste-default-export',
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
    indent: ['warn', 2, {
      SwitchCase: 1,
      flatTernaryExpressions: true,
    }],
    'comma-dangle': ['warn', 'always-multiline'], // No risks, beacuse it will be transpiled
    'space-before-function-paren': ['warn', { anonymous: 'always', named: 'never' }],
    'key-spacing': ['warn', { beforeColon: false, afterColon: true, mode: 'minimum' }],
    'object-curly-spacing': ['warn', 'always'],
    'block-spacing': ['warn', 'always'],
    'padded-blocks': ['warn', { blocks: 'never', switches: 'never', classes: 'never' }],
    'no-shadow': 'warn',
    'import/order': ['warn', { groups: ['builtin', 'external'] }],
    'import/named': 'warn',
    'jsx-quotes': ['warn', 'prefer-double'],
    'prefer-template': 'warn',
    'no-useless-concat': 'warn',
    'no-implicit-coercion': 'warn',
    'no-bitwise': 'warn',
    'lines-between-class-members': ['warn', 'always', { exceptAfterSingleLine: true }],
    'array-element-newline': ['warn', 'consistent'],
    'prefer-object-spread': 'warn',
    'react/jsx-indent': ['warn', 2],
    'react/jsx-indent-props': ['warn', 2],
    'react/jsx-wrap-multilines': ['warn', { return: 'parens-new-line', arrow: 'parens-new-line' }],
    'react/jsx-tag-spacing': 'warn',
    'react/jsx-equals-spacing': ['warn', 'never'],
    'react/jsx-no-duplicate-props': ['warn', { ignoreCase: true }],
    'react/jsx-pascal-case': ['warn', { allowAllCaps: true, ignore: [] }],
    'react/jsx-uses-react': 'warn',
    'react/jsx-uses-vars': 'warn',
    'react/jsx-curly-spacing': ['warn', 'never'],
    'react/no-danger-with-children': 'warn',
    'react/no-direct-mutation-state': 'warn',
    'react/no-is-mounted': 'warn',
    'react/require-render-return': 'warn',
    'react/style-prop-object': 'warn',
    'react/jsx-max-depth': ['warn', { max: 8 }],
    'react/jsx-max-props-per-line': ['warn', { maximum: 5 }],
    'react/self-closing-comp': ['warn', { 'component': true, 'html': true }],
    'react/jsx-first-prop-new-line': ['warn', 'multiline'],
    'react/jsx-no-bind': ['warn', { ignoreRefs: true }],
    'react/no-typos': 'warn',
    'react/jsx-props-no-multi-spaces': 'warn',
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
    'react/jsx-key': 'error',
    'react/no-string-refs': 'error',
    'react/jsx-no-undef': 'error',
    'react/no-deprecated': 'error',
    'react/no-unescaped-entities': 'error',
    'react/jsx-no-target-blank': 'error',
    'react/no-unknown-property': 'error',
    'react/jsx-no-comment-textnodes': 'error',
    'react/react-in-jsx-scope': 'error',
    'promise/no-nesting': 'error',
    'no-copy-paste-default-export/default': 'error',

    // DISABLED ESLINT-CONFIG-STANDARD RULES
    // disable no-debugger because otherwise prettier removes it on save,
    // this is ok because debugger is stripped by uglify
    'no-debugger': 'off',
    // disable eslint-plugin-node rules because they error
    'node/no-deprecated-api': 'off',
    'node/process-exit-as-throw': 'off',
  }),
}
