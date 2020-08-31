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
const standardJSRulesWarn = Object.keys(standardJSRules).reduce((acc, ruleName) => {
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
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      generators: true,
      legacyDecorators: true,
    },

    // FIX of the warning with mobx-react
    requireConfigFile: false,
  },

  plugins: ['import', 'promise', 'react', 'react-hooks', 'no-copy-paste-default-export'],

  settings: {
    react: {
      // Force the react version, otherwise it will log an error to the console
      version: 'detect',
    },
  },

  env: {
    es6: true,
    browser: true,
    node: true,
    jest: true,
  },

  globals: {
    document: 'readonly',
    navigator: 'readonly',
    window: 'readonly',
  },

  rules: {
    ...standardJSRulesWarn,

    // WARNINGS
    indent: [
      'warn',
      2,
      {
        SwitchCase: 1,
        ignoredNodes: ['TemplateLiteral *'],
      },
    ],
    'comma-dangle': [
      'warn',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'never',
      },
    ], // No risks, beacuse it will be transpiled
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
    quotes: ['warn', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
    'no-useless-concat': 'warn',
    'no-implicit-coercion': 'warn',
    'no-bitwise': 'warn',
    'lines-between-class-members': ['warn', 'always', { exceptAfterSingleLine: true }],
    'array-element-newline': ['warn', 'consistent'],
    'prefer-object-spread': 'warn',
    'require-await': 'warn',
    'require-yield': 'warn',
    'no-return-await': 'warn',
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
    'react/no-deprecated': 'warn',
    'react/no-danger-with-children': 'warn',
    'react/no-direct-mutation-state': 'warn',
    'react/no-is-mounted': 'warn',
    'react/require-render-return': 'warn',
    'react/style-prop-object': 'warn',
    'react/jsx-max-depth': ['warn', { max: 8 }],
    'react/jsx-max-props-per-line': ['warn', { maximum: 6 }],
    'react/self-closing-comp': ['warn', { component: true, html: true }],
    'react/jsx-first-prop-new-line': ['warn', 'multiline'],
    'react/no-typos': 'warn',
    'react/jsx-props-no-multi-spaces': 'warn',
    'react-hooks/rules-of-hooks': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'promise/no-callback-in-promise': 'warn',
    'promise/no-return-wrap': 'warn',
    // aligned to prettier, see https://github.com/accurat/accurapp/issues/51
    'generator-star-spacing': ['warn', 'after'],

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
    'react/no-unescaped-entities': 'error',
    'react/jsx-no-target-blank': 'error',
    'react/no-unknown-property': 'error',
    'react/jsx-no-comment-textnodes': 'error',
    'react/react-in-jsx-scope': 'error',
    'promise/no-nesting': 'error',
    'no-copy-paste-default-export/default': 'error',

    // DISABLED ESLINT-CONFIG-STANDARD RULES
    // Disable no-debugger because otherwise prettier removes it on save,
    // this is ok because debugger is stripped by uglify
    'no-debugger': 'off',
    // disable eslint-plugin-node rules because they error
    'node/no-deprecated-api': 'off',
    'node/process-exit-as-throw': 'off',
  },
}
