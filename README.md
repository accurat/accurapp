# AccurApp
This is a project kickstarter for the specific needs of Accurat.
It was originally forked from [create-react-app](https://github.com/facebookincubator/create-react-app/),
but in version 3.0.0 significant amounts of code were rewritten and simplified.

## Getting started:
Add globally the binary `create-accurapp` that will be used to build a new project.
```sh
yarn global add create-accurapp
```

The `create-accurapp` command will handle the folder scaffolding, the dependencies installation, and the git initialization with a first commit.
```sh
create-accurapp project-name
```

Then you just `cd project-name`, run `yarn start` and start creating awesome stuff! 🎉

## Setting up bitbucket
0. Create a new repo
0. Choose `I have an existing project` and follow the instructions

## Setting up the automatic deploy to `project-name.clinent.accurat.io`
0. Go into `Settings > Pipelines - Settings` and enable Bitbucket Pipelines
0. Go into `Settings > Pipelines - Environment Variables` and add the environment variables `DEPLOY_CUSTOMER`, `DEPLOY_PROJECT`, `SLACK_CHANNEL`

## Original documentation:
- [Getting Started](https://github.com/facebookincubator/create-react-app/#getting-started)
- [User Guide](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md)

## Features:
- ESLint config is the one configured for Accurat, `eslint-config-accurapp`, based on StandardJS with some customizations
- Babel presets are `stage-0` and `latest` with decorators support
- GLSL webpack loader, to import shaders and require shaders within shaders

## Project Scaffolding
```
├── build             # created when you run yarn build
├── public            # put the static stuff here (is this needed? only time will tell)
│   └── favicon.ico
├── src
│   ├── components
│   │   └── App.js
│   ├── lib           # put here the stuff you will most likely reuse
│   │   └── README
│   ├── index.css
│   ├── index.html
│   └── index.js
├── .eslintrc         # put here your eslint customizations
├── .gitignore
├── bitbucket-pipelines.yml
├── README.md
├── package.json
├── webpack.config.js
└── yarn.lock
```

## Customizing Webpack
Edit the `webpack.config.js` and add new [webpack-blocks](https://github.com/andywer/webpack-blocks), to see how to create custom blocks, add plugins, add loaders, check out their [docs](https://github.com/andywer/webpack-blocks).
```js
const buildWebpackConfig = require('webpack-preset-accurapp')
const sass = require('@webpack-blocks/sass')

module.exports = buildWebpackConfig([
  sass(),
])
```

## Customizing Babel
Create a `.babelrc` and pass it to `buildWebpackConfig` in the second arguments, which is an object of overrides
```js
// .babelrc
{
  "presets": ["latest"],
  "plugins": ["fast-async"]
}

// webpack.config.js
const buildWebpackConfig = require('webpack-preset-accurapp')

module.exports = buildWebpackConfig([], {
  babel: { babelrc: true },
})
```

## Customizing Eslint
Add your custom rules to the `.eslintrc`


## TODOs
- check the node version in the create-accurapp and accurapp-scripts package instead of the webpack one like it's done [here](https://github.com/facebookincubator/create-react-app/blob/master/packages/create-react-app/index.js)
- use CommonsChunkPlugin for faster build times?
- add tests?
- do more beautiful console output like zeppelin does
