if (parseFloat(process.versions.node) < 6.5) throw new Error('Sorry, Node 6.5+ is required! Tip: use `nvm` for painless upgrades.')

const { addPlugins, createConfig, customConfig, env, entryPoint, setOutput, sourceMaps, webpack } = require('@webpack-blocks/webpack2')
const babel = require('@webpack-blocks/babel6')
const postcss = require('@webpack-blocks/postcss')
const autoprefixer = require('autoprefixer')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin')

const { resolveSrc, glslifyLoader } = require('./customBlocks')

// TODO move browsers in package.json when they will be supported https://github.com/babel/babel-preset-env/issues/149
const browsers = process.env.NODE_ENV === 'development' ? ['last 1 Chrome version'] : ['last 2 versions', 'ie 10']
const babelrc = require('./babelrc')(browsers)

// TODO understand how to customize file-loader in webpack-blocks to set the output asset name line create-react-app does instead of only hash: '[name].[hash:8].[ext]' https://github.com/andywer/webpack-blocks/issues/145

function accuPreset(blocks = [], overrides = {}) {
  return createConfig([
    entryPoint(['babel-polyfill', './src/index.js']),
    setOutput('./build/app.js'),
    resolveSrc(),
    glslifyLoader(),

    addPlugins([
      // Makes some environment variables available to the JS code, for example:
      // if (process.env.NODE_ENV === 'development') { ... }. See `./env.js`.
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': process.env.NODE_ENV,
        'process.env.PUBLIC_URL': process.env.PUBLIC_URL,
      }),
      // Makes some environment variables available in index.html.
      // The public URL is available as %PUBLIC_URL% in index.html, e.g.:
      // <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
      // In development, this will be an empty string.
      new InterpolateHtmlPlugin({
        'NODE_ENV': process.env.NODE_ENV,
        'PUBLIC_URL': process.env.PUBLIC_URL,
      }),
      // Generates an `index.html` file with the <script> injected.
      new HtmlWebpackPlugin({
        inject: true,
        template: './src/index.html'
      }),
      // This is necessary to emit hot updates (currently CSS only):
      new webpack.HotModuleReplacementPlugin(),
      // Watcher doesn't work well if you mistype casing in a path so we use
      // a plugin that prints an error when you attempt to do this.
      // See https://github.com/facebookincubator/create-react-app/issues/240
      new CaseSensitivePathsPlugin(),
      // If you require a missing module and then `npm install` it, you still have
      // to restart the development server for Webpack to discover it. This plugin
      // makes the discovery automatic so you don't have to restart.
      // See https://github.com/facebookincubator/create-react-app/issues/186
      new WatchMissingNodeModulesPlugin('node_modules'),
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
      // devServer(),
      babel(overrides.babel || babelrc),
      // "cheap-module-eval-source-map" instead of the standard "cheap-module-source-map"
      // because build time is faster
      sourceMaps('cheap-module-eval-source-map'),
      customConfig({
        // Turn off performance hints during development because we don't do any
        // splitting or minification in interest of speed. These warnings become
        // cumbersome.
        performance: {
          hints: false,
        },
      }),
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
      babel(overrides.babel || babelrc),
      postcss([
        autoprefixer({ browsers }),
      ]),
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
      babel(overrides.babel || babelrc),
      postcss([
        autoprefixer({ browsers }),
      ]),
      addPlugins([
        new webpack.optimize.UglifyJsPlugin({
          compress: {
            warnings: false,
            drop_console: true,
          },
          output: {
            comments: false,
          },
        }),
      ]),
    ]),

    ...blocks,
  ])
}

module.exports = accuPreset
