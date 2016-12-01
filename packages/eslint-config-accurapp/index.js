/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

// We use eslint-loader so even warnings are very visible.
// This is why we only use "WARNING" level for potential errors,
// and we don't use "ERROR" level at all.

// In the future, we might create a separate list of rules for production.
// It would probably be more strict.

// This loads eslint-config-standard but modifying every 'error' rule to 'warn'.

function errorToWarn (ruleValue) {
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
  acc[ruleName] = ruleValueNew
  return acc
}, {})

module.exports = {
  root: true,

  parser: 'babel-eslint',

  plugins: [
    'import',
    'flowtype',
    'promise',
    'react'
  ],

  env: {
    browser: true,
    commonjs: true,
    es6: true,
    jest: true,
    node: true
  },

  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      generators: true,
      experimentalObjectRestSpread: true
    }
  },

  settings: {
    'import/ignore': [
      'node_modules'
    ],
    'import/extensions': ['.js'],
    'import/resolver': {
      node: {
        extensions: ['.js', '.json']
      }
    }
  },

  rules: Object.assign(standardJSRulesWarn, {
    // WARNINGS
    'comma-dangle': [1, 'always-multiline'], // No risks, beacuse it will be transpiled
    'space-before-function-paren': [1, {anonymous: 'always', named: 'never'}],
    'key-spacing': [1, {beforeColon: false, afterColon: true, mode: 'minimum'}],
    'object-curly-spacing': [1, 'always'],
    'block-spacing': [1, 'always'],
    'padded-blocks': [1, {blocks: 'never', switches: 'never', classes: 'never'}],
    'react/sort-comp': 1,
    'react/jsx-indent': [1, 2],
    'react/jsx-indent-props': [1, 2],
    'react/jsx-wrap-multilines': 1,
    // ERRORS
    'react/no-unused-prop-types': 2,
    'react/jsx-no-bind': [2, {
      ignoreRefs: true,
    }],

    // *** These rules are taken from eslint-config-react-app ***

    // https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/

    // TODO: import rules are temporarily disabled because they don't play well
    // with how eslint-loader only checks the file you change. So if module A
    // imports module B, and B is missing a default export, the linter will
    // record this as an issue in module A. Now if you fix module B, the linter
    // will not be aware that it needs to re-lint A as well, so the error
    // will stay until the next restart, which is really confusing.

    // This is probably fixable with a patch to eslint-loader.
    // When file A is saved, we want to invalidate all files that import it
    // *and* that currently have lint errors. This should fix the problem.
    // (As an exception, import/no-webpack-loader-syntax can be enabled already
    // because it doesn't depend on whether the file exists, so this issue
    // doesn't apply to it.)

    // 'import/default': 'warn',
    // 'import/export': 'warn',
    // 'import/named': 'warn',
    // 'import/namespace': 'warn',
    // 'import/no-amd': 'warn',
    // 'import/no-duplicates': 'warn',
    // 'import/no-extraneous-dependencies': 'warn',
    // 'import/no-named-as-default': 'warn',
    // 'import/no-named-as-default-member': 'warn',
    // 'import/no-unresolved': ['warn', { commonjs: true }],
    // We don't support configuring Webpack using import source strings, so this
    // is always an error.
    'import/no-webpack-loader-syntax': 'error',

    // https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules
    'react/jsx-equals-spacing': ['warn', 'never'],
    'react/jsx-no-duplicate-props': ['warn', { ignoreCase: true }],
    'react/jsx-no-undef': 'warn',
    'react/jsx-pascal-case': ['warn', {
      allowAllCaps: true,
      ignore: [],
    }],
    'react/jsx-uses-react': 'warn',
    'react/jsx-uses-vars': 'warn',
    'react/no-danger-with-children': 'warn',
    'react/no-deprecated': 'warn',
    'react/no-direct-mutation-state': 'warn',
    'react/no-is-mounted': 'warn',
    'react/react-in-jsx-scope': 'error',
    'react/require-render-return': 'warn',
    'react/style-prop-object': 'warn',

    // https://github.com/gajus/eslint-plugin-flowtype
    'flowtype/define-flow-type': 'warn',
    'flowtype/require-valid-file-annotation': 'warn',
    'flowtype/use-flow-type': 'warn'
  })
};
