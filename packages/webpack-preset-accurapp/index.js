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
  match,
} = require('@webpack-blocks/webpack')
const { css } = require('@webpack-blocks/assets')
const devServer = require('@webpack-blocks/dev-server')
const babel = require('@webpack-blocks/babel')
const postcss = require('@webpack-blocks/postcss')
const autoprefixer = require('autoprefixer')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const path = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin')

const {
  imageLoader,
  videoLoader,
  fontLoader,
  glslifyLoader,
  eslintLoader,
  resolveSrc,
  prependEntry,
} = require('./customBlocks')

function accuPreset(config = []) {
  return createConfig([
    entryPoint('./src/index.js'),
    setOutput({
      path: path.resolve('./build'),
      filename: 'app.[chunkhash:8].js',
      publicPath: `/${process.env.PUBLIC_URL}`,
    }),

    // Loaders
    match(['*.css', '!*.module.css'], [
      css({
        minimize: process.env.NODE_ENV === 'production',
        sourceMap: process.env.NODE_ENV !== 'production',
      }),
    ]),
    match('*.module.css', [
      css.modules({
        minimize: process.env.NODE_ENV === 'production',
        sourceMap: process.env.NODE_ENV !== 'production',
      }),
    ]),
    postcss({
      plugins: [
        autoprefixer({ flexbox: 'no-2009' }),
      ],
    }),
    babel(),
    fontLoader(),
    imageLoader(),
    videoLoader(),
    glslifyLoader(),

    // Import components without doing the ../../../
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
      devServer({
        compress: true,
        clientLogLevel: 'none',
        contentBase: './public/',
        watchContentBase: true,
        quiet: true,
        watchOptions: {
          ignored: /node_modules/,
        },
        overlay: false,
      }),
      eslintLoader(),
      addPlugins([
        // Automatic rediscover of packages after `npm install`
        new WatchMissingNodeModulesPlugin('node_modules'),
      ]),
      // Faster 'cheap-module-eval-source-map' instead of the standard 'cheap-module-source-map'
      sourceMaps('cheap-module-eval-source-map'),
      // Turn off performance hints during development
      performance({ hints: false }),
      customConfig({ mode: 'development' }),
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
      sourceMaps('source-map'),
      customConfig({
        mode: 'production',
        optimization: { minimize: false },
      }),
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
      customConfig({
        mode: 'production',
        optimization: {
          minimizer: [
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
          ],
        },
      }),
    ]),

    ...(Array.isArray(config) ? config : [customConfig(config)]),
  ])
}

module.exports = accuPreset
