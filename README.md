# AccurApp
This is a project kickstarter for the specific needs of Accurat.
It was originally forked from [create-react-app](https://github.com/facebookincubator/create-react-app/),
but in version 3.0.0 significant amounts of code were rewritten and simplified. Here are some added features:

- ESLint config is the one configured for Accurat, `eslint-config-accurapp`, based on StandardJS with some customizations
- Babel presets are `stage-0` and `latest` with decorators support
- GLSL webpack loader, to import shaders and require shaders within shaders

## Creating a new project:
Having installed yarn (`brew install yarn`), run this command in the directory where you want to create the `project-name` folder. This command will also handle the project scaffolding, the dependencies installation, and the git initialization with a first commit.
```sh
yarn create accurapp project-name
```

Then you just `cd project-name`, run `yarn start` and start creating awesome stuff! 🎉

#### Setting up bitbucket
1. Create a new repo
1. Choose `I have an existing project` and follow the instructions

#### Setting up the automatic deploy
1. Go into `Settings > Pipelines - Settings` and enable Bitbucket Pipelines
1. Go into `Settings > Pipelines - Environment Variables` and add the environment variables `DEPLOY_CUSTOMER`, `DEPLOY_PROJECT`, `SLACK_CHANNEL`

## Usage
These are the available commands once you created a project:
- `yarn start` starts a server locally, accessible both from your browser and from another machine using your same wi-fi
- `yarn build` builds the project for production, ready to be deployed from the `build/` folder

#### Customizing Webpack
You can pass the custom webpack config to the `buildWebpackConfig` function in the project's `webpack.config.js`.
```js
const buildWebpackConfig = require('webpack-preset-accurapp')

module.exports = buildWebpackConfig({
  target: 'node',
})
```

Or to make your life easier, you could also use [webpack-blocks](https://github.com/andywer/webpack-blocks/tree/release/1.0), it's a nice level of abstraction over the webpack configuration, you can add loaders, plugins, configuration with just one line.
```js
const buildWebpackConfig = require('webpack-preset-accurapp')
const { sass } = require('webpack-blocks')

module.exports = buildWebpackConfig([
  sass(),
])
```

#### Customizing Babel
```js
// TODO do a babel-preset-accurapp if we need to customize babel
```

#### Customizing Eslint
Add your custom rules to the `.eslintrc`

## Project Scaffolding
```
├── build             # created when you run yarn build
├── public            # put the static stuff here
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

## Contributing
If you make some edits and wish to test them locally you can run `yarn create-test-app` which creates a test app using the local packages.

## Original documentation:
- [Getting Started](https://github.com/facebookincubator/create-react-app/#getting-started)
- [User Guide](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md)

## TODOs
- use CommonsChunkPlugin for faster build times?
- do more beautiful console output like zeppelin does
