## ![AccurApp](logo.png)

**AccurApp** is a project kickstarter customized for the specific needs of [Accurat](http://accurat.it/).

It was originally forked from [create-react-app](https://github.com/facebookincubator/create-react-app/),
but significant amounts of code were rewritten and simplified. Here are some shiny features:

- **ESLint** config based on [StandardJS](https://standardjs.com/) with some opinionated customizations, also with addition of a lot of React rules. [See all the rules here](https://github.com/accurat/accurapp/blob/master/packages/eslint-config-accurapp/index.js).
- **Babel** preset based on the supported browsers with the addition of the [stage-0](https://babeljs.io/docs/plugins/preset-stage-0/) preset and the [macros](https://github.com/kentcdodds/babel-plugin-macros) plugin. Node_modules are transpiled also.
- Possibility to define your custom **supported browsers** (both for dev and prod) in the `browserslist` field of `package.json`. This will affect the Babel transpilation and the CSS Autoprefixing.
- **GLSL webpack loader** to import shaders and require shaders within shaders.
- **CSV webpack loader** to import .csv files as an array of JSONs.
- **React SVG loader** to import .svg files as react components, useful for icons. Svgs get also optimized with [svgo](https://github.com/svg/svgo).
- **CSS Modules** support in files that end with `*.module.css`. [Read more about CSS Modules here](https://github.com/css-modules/css-modules).
- **CSS postprocessing** using postcss to enable [Autoprefixing](https://github.com/postcss/autoprefixer) and [CSS Nesting](https://github.com/postcss/postcss-nested).
- **JSON5 webpack loader** to import .json5 files. [Read more about JSON5 here](https://json5.org/).

## Table of contents
- [Creating a new project](#creating-a-new-project)
- [Customization](#customization)
  - [Customizing Webpack](#customizing-webpack)
  - [Customizing Eslint](#customizing-eslint)
  - [Customizing Babel](#customizing-babel)
  - [Setting Env Variables](#cetting-env-variables)
  - [Customizing Env Variables](#customizing-env-variables)
- [Available Env Variables](#available-env-variables)
- [Project Scaffolding](#project-scaffolding)
- [F.A.Q.](#faq)
  - [How do I enable hot reloading for the state?](#faq)
  - [Where do I put the images?](#faq)
  - [Where do I put the custom fonts?](#faq)
  - [What is the public folder for?](#faq)
  - [How do I handle svg files?](#faq)
  - [How do I enable TypeScript?](#faq)
  - [How do I override a webpack loader?](#faq)
  - [What's all the fuss about FUSS?](#faq)
  - [How do I enable prettier?](#faq)
  - [I need to support IE11. What do I do?](#faq)
  - [How do I use a web worker?](#faq)
  - [How do I use a service worker?](#faq)
- [Contributing](#contributing)

## Creating a new project
Having installed node (`brew install node`), run this command in the directory where you want to create the `project-name` folder. This command will also handle the project scaffolding, the dependencies installation, and the git initialization with a first commit.
```sh
npx --ignore-existing create-accurapp project-name
```
_(**Note**: if it says `npx: command not found` update your node version by running `brew upgrade node`)_

Then you just `cd project-name`, run `yarn start` and start creating awesome stuff! 🎉

#### Setting up bitbucket
1. Create a new repo - [link](https://bitbucket.org/repo/create)
1. Be sure to choose `accurat` as Owner, not yourself.
1. Choose `Get your local Git repository on Bitbucket` and follow the instructions

#### Setting up the automatic deploy
If you're using bitbucket pipelines:
1. Go into `Settings > Pipelines - Settings` and enable Bitbucket Pipelines
1. Go into `Settings > Pipelines - Environment Variables` and add the environment variables `DEPLOY_CUSTOMER`, `DEPLOY_PROJECT`, `SLACK_CHANNEL`

Otherwise if you're using netlify:
1. Login into [netlify.com](https://app.netlify.com/)
1. Click `New site from Git`
1. Click `Bitbucket` and select the repo you created from the list
1. Select `accurat` from the team list
1. Create the project
1. Go into `Site settings` and click `Change site name` to update the generated url with a more appropriate one
1. Go into `Build & deploy` > `Edit Settings` and select `Branch deploys: All`
1. To enable **slack notifications**
  1. First you have to get the incoming webhook url in slack by going to `Customize Slack` > `Configure apps` > `Custom integrations` > `Incoming WebHooks` and click `Add configuration`
  1. Then you have to paste it in `Build & deploy` > `Deploy notifications` > `Slack` > `Deploy succeeded`
1. Deploy site!
1. Enable the slack notifications to the desired channel

#### Commands
These are the available commands once you created a project:
- `yarn start` starts a server locally, accessible both from your browser and from another machine using your same wi-fi
- `yarn build` builds the project for production, ready to be deployed from the `build/` folder
- `yarn lint` lints with eslint the `src/` folder. You can pass any [eslint options](https://eslint.org/docs/user-guide/command-line-interface#options) to the lint command, for example if you want to use eslint's fix option, you do it like this:
```json
"lint-fix": "accurapp-scripts lint --fix",
```
- `yarn prettier` prettifies all the code in the `src/` folder, overwriting the files. You can pass options also to this command, for example if you want to print only the files which would be prettified but don't overwrite them:
```json
"prettier-check": "accurapp-scripts prettier --list-different",
```

**NOTE**: you need to have at least Node v6.x and yarn v1.2.1, make sure you have the correct versions if you run into some problems running these commands. You can check their version by running `node -v` and `yarn -v`.

## Customization
#### Customizing Webpack
You can pass a custom webpack config to the `buildWebpackConfig` function in the project's `webpack.config.js`.
```js
const { buildWebpackConfig } = require('webpack-preset-accurapp')

module.exports = buildWebpackConfig({
  target: 'node',
})
```

Or to make your life easier, you could also use [webpack-blocks](https://github.com/andywer/webpack-blocks/tree/release/release-2.0), it's a nice level of abstraction over the webpack configuration, you can add loaders, plugins, configuration with just one line.
```js
const { buildWebpackConfig } = require('webpack-preset-accurapp')
const { sass } = require('webpack-blocks')

module.exports = buildWebpackConfig([
  sass(),
])
```

For example, this is the way to customize the webpack-dev-server options.
```js
const { buildWebpackConfig } = require('webpack-preset-accurapp')
const { env, devServer } = require('webpack-blocks')

module.exports = buildWebpackConfig([
  env('development', [
    devServer({
      // your custom options here
    }),
  ]),
])
```

Or this is a way to add a custom loader.
```js
const { buildWebpackConfig } = require('webpack-preset-accurapp')

function workerLoader() {
  return (context, { addLoader }) => addLoader({
    test: /\.worker\.js$/,
    loader: 'worker-loader',
  })
}

module.exports = buildWebpackConfig([
  workerLoader(),
])
```

And this is a way to add a custom plugin.
```js
const { buildWebpackConfig } = require('webpack-preset-accurapp')
const { addPlugins } = require('webpack-blocks')
const NpmInstallPlugin = require('npm-install-webpack-plugin')

module.exports = buildWebpackConfig([
  addPlugins([
    new NpmInstallPlugin(),
  ]),
])
```

Also you can still pass a custom webpack config using webpack-blocks.
```js
const { buildWebpackConfig } = require('webpack-preset-accurapp')
const { customConfig } = require('webpack-blocks')

module.exports = buildWebpackConfig([
  // ...other blocks
  customConfig({
    target: 'node',
  }),
])
```

#### Customizing Eslint
Add your custom rules to the `.eslintrc`
```js
{
  "extends": "eslint-config-accurapp",
  "rules": {
    "no-shadow": "off"
  }
}
```

#### Customizing Babel
Add your custom presets/plugins to the `.babelrc`
```js
{
  "presets": ["accurapp"],
  "plugins": [
    ["lodash", { "id": ["lodash", "recompose"] }]
  ]
}
```

#### Setting Env Variables
All the Env Variables are automatically injected into the application (if used), no need to use webpack's `DefinePlugin`.

You can define your variables in those different places, **in order of importance** (1 will override 2 and 2 will override 3):

1. in the `package.json`'s scripts section:
```json
  "start": "HTTPS=true accurapp-scripts start",
```
1. in the CI config script:
```yml
  script:
    - GENERATE_SOURCEMAP=true yarn build
```
1. in the `.env` file:
```
SECRET=djah7s9ihdias7hdsaodhoas8hd
```

**NOTE**: if you don't wish to have too many variables in the scripts section, you could also use a combo of the `.env.example` during CI and the `.env` file in local. If the `process.env.CI` is true, `.env.example` is used instead of `.env`.

#### Customizing Env Variables
Here are the available Env Variables for the **yarn start** script:
- **HOST** - The host of the web server (default `localhost`)
- **PORT** - The port of the web server (default `8000`)
- **HTTPS** - Set this to `true` if you wish to use HTTPS in development (default `false`)

Here are instead the available Env Variables for the **yarn build** script:
- **PUBLIC_URL** - Use this if the application is hosted on a subpath, it will be used to resolve assets (default `/`).
Here are some examples of its usage:
```html
<link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
```
```js
render() {
  return <img src={`${process.env.PUBLIC_URL}/img/logo.png`} />;
}
```

- **GENERATE_SOURCEMAP** - Use this if you want to generate the external sourcemaps files (default `false`)

- **TRANSPILE_NODE_MODULES** - Set this to false if you want to disable the babel transpilation of the `node_modules` (default `true`)

## Available Env Variables
These are the Env Variables that Accurapp provides you, you cannot modify them directly:
- **LATEST_TAG** - The latest git tag you made, useful if you want to display a build version in your application
- **LATEST_COMMIT** - The latest commit hash, useful if you want to display a more specific build version
- **LATEST_COMMIT_TIMESTAMP** - The UTC timestamp of the latest commit, you can use it like this:

```js
new Date(Number(process.env.LATEST_COMMIT_TIMESTAMP))
```

- **BROWSERSLIST** - It is built from the `browserslist` field in the `package.json`, and you can use it in your app like this:

```js
import isBrowserSupported from 'is-browser-supported'

if (!isBrowserSupported(navigator.userAgent, process.env.BROWSERSLIST)) {
  // show the "unsupported browser" overlay
}
```


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
├── .babelrc
├── .env.example
├── .eslintrc
├── .gitignore
├── bitbucket-pipelines.yml
├── README.md
├── package.json
├── webpack.config.js
└── yarn.lock
```

## F.A.Q.

<details>
<summary>How do I enable hot reloading for the state?</summary>

By default, hot reloading is enabled for the react components tree in accurapp, but if you want to hot-reload also the [mobx-state-tree](https://github.com/mobxjs/mobx-state-tree) files, your `index.js` should look like this:
```js
let state = State.create()

function renderApp() {
  ReactDOM.render(
    <MobxProvider state={state}>
      <App/>
    </MobxProvider>,
    document.getElementById('root'),
  )
}

// First render
renderApp()

// Hot module reloading
if (module.hot) {
  // Some component changed, rerender the app
  // and let the react-diffing handle the changes
  module.hot.accept('components/App', () => {
    console.clear()
    renderApp()
  })

  // Store definition changed, recreate a new one from old state and rerender
  module.hot.accept('state', () => {
    state = State.create(getSnapshot(state))
    console.clear()
    renderApp()
  })
}
```
The first argument to `module.hot.accept` must be the root component of the app, often the `Routes` component is used.
</details>

<details>
<summary>Where do I put the images?</summary>

You can put them in the `src/images` folder and require them from the js like this:
```js
import logo from 'images/logo.png'

console.log(logo) // /logo.84287d09.png

function Header() {
  // Import result is the URL of your image
  return <img src={logo} alt="Logo" />
}
```

or from the CSS (see [css-loader](https://github.com/webpack-contrib/css-loader) for more info):
```css
.Logo {
  background-image: url(~images/logo.png);
}
```
The advantage is that it creates a hash in the filename to invalidate eventual caching. Another thing is that images that are less than 10,000 bytes are imported as a [data URI](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs) instead of a path, to reduce the number of requests to the server.

Also you could tell webpack to automatically optimize the images you import with the [imagemin-webpack-plugin](https://github.com/Klathmon/imagemin-webpack-plugin).
</details>

<details>
<summary>Where do I put the custom fonts?</summary>

You can put them in the `src/fonts` folder and require them from the CSS like this (see [css-loader](https://github.com/webpack-contrib/css-loader) for more info):

```css
@font-face {
  font-family: 'Helvetica Neue';
  src: url('~fonts/HelveticaNeue-Thin.ttf') format('truetype');
  font-weight: 200;
}
```
</details>

<details>
<summary>What is the `public` folder for?</summary>

You usually put the assets you require from the `index.html` here. Like for example the favicon.

You should try as much as possible to require the .css and .js file from the `src` folder, so they are bundled and optimized. For example if you need a service worker file just for making the app work offline, use the [offline-plugin](https://github.com/NekR/offline-plugin). An alternative is the [workbox-webpack-plugin](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin).

You should also try as much as possible to avoid putting images in the `public` folder, because missing images would cause 404 errors for the users instead of compilation errors.
</details>

<details>
<summary>How do I handle svg files?</summary>

By default you can import svgs as files, like you would do for images:
```js
import logo from 'images/logo.svg'

console.log(logo) // /logo.84287d09.svg

function Header() {
  // Import result is the URL of your svg
  return <img src={logo} alt="Logo" />
}
```

But if the svg is an icon, and you need to apply some styles to it, you can also import it as a react component, and pass it some `className` or `style` props:
```js
import { ReactComponent as PencilIcon } from 'icons/pencil.svg'

// It's like doing
// function PencilIcon(props) {
//   return (
//     <svg viewBox="..." {...props}>
//       ...
//     </svg>
//   )
// }

function Edit() {
  // .db displays the svg as a block, removing the little space
  // underneath that the default inline-block svg has
  //
  // .w1 sets the dimensions, you can also set the dimensions
  // in px using the style attribute
  //
  // .black colors the icon black, like you would do with text
  return <PencilIcon className="db w1 black" />
}
```
Under the hood, the loader basically wraps the svg file inside a react component, so you can treat it as such.

Furthermore it optimizes and minifies the svg using [svgo](https://github.com/svg/svgo), so it cleans up automatically the ugly and noisy svg that Illustrator exports 🙌.
</details>

<details>
<summary>How do I enable TypeScript?</summary>

TypesScript is not enabled by default in accurapp for now, this is what you have to do.

Do `yarn add --dev webpack-blocks-ts`.

Then, in `webpack.config.js` replace all content with:
```js
const { buildWebpackConfig } = require('webpack-preset-accurapp')
const typescript = require('webpack-blocks-ts')

module.exports = buildWebpackConfig([
  typescript({ silent: true }),
])
```

Then add a `tsconfig.json` in the project root, a default tsconfig looks like this:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "rootDir": ".",
    "outDir": "build",
    "module": "esnext",
    "target": "es5",
    "lib": ["es6", "es7", "es2017", "ESNext", "dom"],
    "sourceMap": true,
    "allowJs": true,
    "jsx": "react",
    "moduleResolution": "node",
    "forceConsistentCasingInFileNames": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noImplicitAny": true,
    "strictNullChecks": false,
    "suppressImplicitAnyIndexErrors": true,
    "noUnusedLocals": false,
    "experimentalDecorators": true
  },
  "exclude": [
    "node_modules",
    "build",
    "webpack.config.js"
  ]
}
```

If you really need it, you can also add the `allowSyntheticDefaultImports` flag and set it to `true`, and remove `ESNext` from the `lib` compiler option. See the [TypeScript compiler options](https://www.typescriptlang.org/docs/handbook/compiler-options.html) for more on this.

Add as devDependencies typescript and the types of the libraries you're using, for example `yarn add --dev typescript @types/react @types/react-dom`

Rename `index.js` to `main.tsx` and edit the first two imports like this:
```js
import * as React from 'react'
import * as ReactDOM from 'react-dom'
```

Add a new `index.js` file and simply add
```js
import 'main'
```

Rename `src/components/App.js` to `src/components/App.tsx` and inside it, edit the `React` import like this:

```js
import * as React from 'react'
```

Ready to go!

Please remember that the first two items to annonate for class components are its props and local state. So to do it correctly you would need something along the lines of

```ts
type Props = {}
type LocalState = {}
// or
// interface Props {}
// interface LocalState {}

export default class App extends React.Component<Props, LocalState> {
  render() {
    return <div>...</div>
  }
}
```

See the [Typescript JSX guide](https://www.typescriptlang.org/docs/handbook/jsx.html) for more info.
</details>

<details>
<summary>How do I override a webpack loader?</summary>

The easiest way to override a loader is to do it inline, by prefixing the import with a `!`.

For example:

```js
import csvString from '!raw-loader!data/some_data.csv'
```
This will override the default `csv-loader` for that file.

[See the related docs](https://webpack.js.org/concepts/loaders/#inline).

Make sure to disable the related eslint rule like this:
```js
{
  "extends": "eslint-config-accurapp",
  "rules": {
    "import/no-webpack-loader-syntax": "off"
  }
}
```
</details>

<details>
<summary>What's all the fuss about FUSS?</summary>

Accurapp comes with [postcss-fuss](https://github.com/marcofugaro/postcss-fuss/tree/function-updates), a postcss plugin that lets you generate custom functional css classes, in the [tachyons](https://raw.githubusercontent.com/tachyons-css/tachyons/master/css/tachyons.css) way. It's useful if you want to define custom colors, and don't want to write all the classes by hand. And for many other stuff.

For example, this is what you write in your `style.css`:

```css
@fuss color(tomato, #ff6347);
```

And this is what the generated css looks like:

```css
.tomato { color: #ff6347 }
.bg-tomato { background-color: #ff6347 }
.b--tomato { border-color: #ff6347 }
```

There are other preset functions, like `color-variants()` which outputs both a lighter and darker version of the color, `color-states()` which outputs the classes in the hover active and focus pseudo-classes. You can even create your own custom modifier function!

[More info in the postcss-fuss readme.](https://github.com/marcofugaro/postcss-fuss/tree/function-updates)
</details>

<details>
<summary>How do I enable prettier?</summary>

Prettier is already configured in the projects scaffolded by accurapp, you just need to install the prettier plugin in your editor of choice and tell it to read the project's configuration.

You should also configure prettier to run on save, it is really useful especially when you paste code from stackoverflow.
</details>

<details>
<summary>I need to support IE11. What do I do?</summary>

First of all, we're sorry for you, IE is an asshole.

You first need to edit the `package.json`'s `"browserslist"` field, and change `not ie 11` to `ie 11`. If you need to test in local you can also add `ie 11` to the development browsers.

You will now have to provide polyfills for the newer apis you're using, for example [the fetch polyfill](https://github.com/github/fetch), or the [css variables ponyfill](https://github.com/jhildenbiddle/css-vars-ponyfill). Also make sure the tools you're using support IE11, for example MobX v5 has no support for IE11.

Now hopefully you will not have any js errors in IE11 (if not, call Dr. Fugaro).

You still have some css fixes to do, for example flexbox behaves weirdly, [here are some tips on how to handle this issue](https://philipwalton.com/articles/normalizing-cross-browser-flexbox-bugs/).
</details>

<details>
<summary>How do I use a web worker?</summary>

You can use the [worker-loader](https://github.com/webpack-contrib/worker-loader) and configure it to read files ending in `.worker.js`. Here is the code:

```js
const { buildWebpackConfig } = require('webpack-preset-accurapp')

function workerLoader() {
  return (context, { addLoader }) => addLoader({
    test: /\.worker\.js$/,
    loader: 'worker-loader',
  })
}

module.exports = buildWebpackConfig([
  workerLoader(),
])
```
</details>

<details>
<summary>How do I use a service worker?</summary>

If you just need the app to work offline, use the [offline-plugin](https://github.com/NekR/offline-plugin).

Otherwise, put the `service-worker.js` file in the `public/` folder, and register it normally.
</details>

## Contributing
If you make some edits and wish to test them locally you can run `yarn create-test-app` which creates a test app using the local packages.

To publish the updated packages, run `yarn run publish`, lerna will detect the packages you changed and ask you for the new version number.
