const webpack = require('webpack')
const {
  createConfig,
  addPlugins,
  customConfig,
  entryPoint,
  setOutput,
  env,
  performance,
  sourceMaps,
} = require('@webpack-blocks/webpack')
const { css } = require('@webpack-blocks/assets')
const babel = require('@webpack-blocks/babel')
const postcss = require('@webpack-blocks/postcss')
const autoprefixer = require('autoprefixer')
const path = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const {
  imageLoader,
  videoLoader,
  fontLoader,
  glslifyLoader,
  eslintLoader,
  resolveSrc,
  prependEntry,
} = require('./customBlocks')

// TODO move browsers in package.json when they will be supported https://github.com/babel/babel-preset-env/issues/149
const browsers = process.env.NODE_ENV === 'development' ? ['last 1 Chrome version'] : ['last 2 versions', 'ie 10']
const babelrc = require('./babelrc')(browsers)

function accuPreset(config = []) {
  return createConfig([
    entryPoint([
      // Include all polyfills we can, to prevent cross-browser bugs.
      'babel-polyfill',
      // Your app's code.
      './src/index.js',
    ]),
    setOutput({
      path: path.resolve('./build'),
      filename: 'app.js',
      publicPath: process.env.PUBLIC_URL ? `/${process.env.PUBLIC_URL}/` : '/',
    }),

    // Loaders
    css(),
    babel(babelrc),
    fontLoader(),
    imageLoader(),
    videoLoader(),
    glslifyLoader(),

    resolveSrc(),

    addPlugins([
      // Makes some environment variables available to the JS code
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        'process.env.PUBLIC_URL': JSON.stringify(process.env.PUBLIC_URL),
      }),
      // Makes some environment variables available in index.html. Example: %PUBLIC_URL%
      new InterpolateHtmlPlugin({
        'NODE_ENV': process.env.NODE_ENV,
        'PUBLIC_URL': process.env.PUBLIC_URL,
      }),
      // Generates an `index.html` file with the <script> injected.
      new HtmlWebpackPlugin({
        inject: true,
        template: './src/index.html',
      }),
      // Check case of paths, so case-sensitive filesystems won't complain:
      new CaseSensitivePathsPlugin(),
    ]),

    //
    // $$$$$$$\     $$$$$$$$\    $$\    $$\
    // $$  __$$\    $$  _____|   $$ |   $$ |
    // $$ |  $$ |   $$ |         $$ |   $$ |
    // $$ |  $$ |   $$$$$\       \$$\  $$  |
    // $$ |  $$ |   $$  __|       \$$\$$  /
    // $$ |  $$ |   $$ |           \$$$  /
    // $$$$$$$  |   $$$$$$$$\       \$  /
    // \_______/    \________|       \_/
    //
    env('development', [
      prependEntry('react-dev-utils/webpackHotDevClient'),
      eslintLoader(),
      addPlugins([
        // This is necessary to emit hot updates (currently CSS only)
        new webpack.HotModuleReplacementPlugin(),
        // Automatic rediscover of packages after `npm install`
        new WatchMissingNodeModulesPlugin('node_modules'),
      ]),
      // Faster 'cheap-module-eval-source-map' instead of the standard 'cheap-module-source-map'
      sourceMaps('cheap-module-eval-source-map'),
      // Turn off performance hints during development
      performance({ hints: false }),
    ]),

    //
    //  $$$$$$\     $$$$$$$$\     $$$$$$\      $$$$$$\     $$$$$$\    $$\   $$\     $$$$$$\
    // $$  __$$\    \__$$  __|   $$  __$$\    $$  __$$\    \_$$  _|   $$$\  $$ |   $$  __$$\
    // $$ /  \__|      $$ |      $$ /  $$ |   $$ /  \__|     $$ |     $$$$\ $$ |   $$ /  \__|
    // \$$$$$$\        $$ |      $$$$$$$$ |   $$ |$$$$\      $$ |     $$ $$\$$ |   $$ |$$$$\
    //  \____$$\       $$ |      $$  __$$ |   $$ |\_$$ |     $$ |     $$ \$$$$ |   $$ |\_$$ |
    // $$\   $$ |      $$ |      $$ |  $$ |   $$ |  $$ |     $$ |     $$ |\$$$ |   $$ |  $$ |
    // \$$$$$$  |      $$ |      $$ |  $$ |   \$$$$$$  |   $$$$$$\    $$ | \$$ |   \$$$$$$  |
    //  \______/       \__|      \__|  \__|    \______/    \______|   \__|  \__|    \______/
    //
    env('staging', [
      postcss({
        plugins: [
          autoprefixer({ browsers }),
        ],
      }),
      sourceMaps('source-map'),
    ]),

    //
    // $$$$$$$\     $$$$$$$\      $$$$$$\     $$$$$$$\
    // $$  __$$\    $$  __$$\    $$  __$$\    $$  __$$\
    // $$ |  $$ |   $$ |  $$ |   $$ /  $$ |   $$ |  $$ |
    // $$$$$$$  |   $$$$$$$  |   $$ |  $$ |   $$ |  $$ |
    // $$  ____/    $$  __$$<    $$ |  $$ |   $$ |  $$ |
    // $$ |         $$ |  $$ |   $$ |  $$ |   $$ |  $$ |
    // $$ |         $$ |  $$ |    $$$$$$  |   $$$$$$$  |
    // \__|         \__|  \__|    \______/    \_______/
    //
    env('production', [
      postcss({
        plugins: [
          autoprefixer({ browsers }),
        ],
      }),
      addPlugins([
        new UglifyJsPlugin({
          uglifyOptions: {
            ecma: 8,
            compress: {
              // Remove all console.logs
              drop_console: true,
              // Disabled because of an issue with Uglify breaking seemingly valid code:
              // https://github.com/facebook/create-react-app/issues/2376
              // Pending further investigation:
              // https://github.com/mishoo/UglifyJS2/issues/2011
              comparisons: false,
            },
            output: {
              // Turned on because emoji and regex is not minified properly using default
              // https://github.com/facebook/create-react-app/issues/2488
              ascii_only: true,
            },
          },
          // Use multi-process parallel running to improve the build speed
          // Default number of concurrent runs: os.cpus().length - 1
          parallel: true,
          // Enable file caching
          cache: true,
        }),
      ]),
    ]),

    ...(Array.isArray(config) ? config : [customConfig(config)]),
  ])
}

module.exports = accuPreset
