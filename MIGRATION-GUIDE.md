# Migrating to AccurApp v4.x

This is the migration guide for upgrading from AccurApp v3.x to v4.x. It is a major update with a couple of breaking changes.

- The `webpack-preset-accurapp` changed its default export, this is the new basic `webpack.config.js`:
```js
const { buildWebpackConfig } = require('webpack-preset-accurapp')

module.exports = buildWebpackConfig()
```

- You will need to explicitly set the browserslist in your `package.json`, this will affect Babel and Autoprefixer, this is the suggested config for example:
```json
  "browserslist": {
    "production": [
      ">0.25%",
      "not ie 11",
      "not op_mini all"
    ],
    "development": [
      "last 1 Chrome version"
    ]
  }
```

- You can now configure Babel, make a new `.babelrc` in the project root with these contents
```json
{
  "presets": ["accurapp"]
}
```
and run `yarn add --dev babel-preset-accurapp`

- setting the `NODE_ENV` from the outside is being deprecated, it is preferred to use different Env variables or some argv arguments.
So the previous CI script for staging
```yml
  script:
    - NODE_ENV=staging yarn build
```
now becomes
```yml
  script:
    - GENERATE_SOURCEMAP=true yarn build
```
This is more explicit.

- add the lint script to scripts section in the package.json:
```json
"lint": "accurapp-scripts lint",
```
