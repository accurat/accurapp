const path = require('path')
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
const postcss = require('@webpack-blocks/postcss')
const autoprefixer = require('autoprefixer')
const nested = require('postcss-nested')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin')
const Dotenv = require('dotenv-webpack')

const {
  babel,
  imageLoader,
  videoLoader,
  fontLoader,
  glslifyLoader,
  eslintLoader,
  csvLoader,
  svgLoader,
  resolveSrc,
  prependEntry,
  mode,
  uglify,
  optimization,
} = require('./customBlocks')

function accuPreset(config = []) {
  return createConfig([
    entryPoint('./src/index.js'),
    setOutput({
      path: path.resolve('./build'),
      filename: 'app.[hash:8].js',
      publicPath: process.env.PUBLIC_URL ? `/${process.env.PUBLIC_URL}/` : '/',
    }),

    // Loaders
    // TODO use this when the new version of webpack-block is released
    // match(['*.css', '!*.module.css'], [
    // ]),
    match('*.css', { exclude: /^.*\.module.css$/ }, [
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
        nested,
      ],
    }),
    // TODO use this when the new version of webpack-block is released
    // match(['*.{js,jsx}', '!*node_modules*'], [
    // ]),
    match('*.{js,jsx}', { exclude: /node_modules/ }, [
      babel({
        compact: process.env.NODE_ENV === 'production',
      }),
    ]),
    // Only transpile the latest stable ECMAScript features from node_modules.
    // This is because some node_modules may be written in a newer ECMAScript
    // version than the browsers you're actially supporting
    match('*.js', { include: /node_modules/ }, [
      babel({
        compact: process.env.NODE_ENV === 'production',
        babelrc: false,
        presets: [
          ['@babel/preset-env', { modules: false }],
        ],
      }),
    ]),
    fontLoader(),
    imageLoader(),
    videoLoader(),
    glslifyLoader(),
    csvLoader(),
    svgLoader(),

    // Import components without doing the ../../../
    resolveSrc(),

    optimization({
      // Automatically split vendor and app code
      // https://twitter.com/wSokra/status/969633336732905474
      splitChunks: {
        chunks: 'all',
      },
    }),

    addPlugins([
      // Like webpack.DefinePlugin, but also reads the .env file, giving however priority to
      // the envs already there (like NODE_ENV or variable set from the command line or CI)
      new Dotenv({
        systemvars: true,
        silent: true,
      }),
      // Generates an `index.html` file with the <script> injected.
      new HtmlWebpackPlugin({
        inject: true,
        template: './src/index.html',
      }),
      // Makes some environment variables available in index.html. Example: %PUBLIC_URL%
      new InterpolateHtmlPlugin({
        'NODE_ENV': process.env.NODE_ENV,
        'PUBLIC_URL': process.env.PUBLIC_URL ? `/${process.env.PUBLIC_URL}` : '',
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
      mode('development'),
      prependEntry('react-dev-utils/webpackHotDevClient'),
      devServer({
        compress: true,
        clientLogLevel: 'none',
        contentBase: './public/',
        publicPath: process.env.PUBLIC_URL ? `/${process.env.PUBLIC_URL}/` : '/',
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
      // and better sourcemaps instead of 'eval' of the development mode
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
      mode('production', { minimize: false }),
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
      mode('production'),
      uglify({
        uglifyOptions: {
          ecma: 8,
          compress: {
            // Remove all console.logs
            drop_console: true,
          },
        },
        // Use multi-process parallel running to improve the build speed
        // Default number of concurrent runs: os.cpus().length - 1
        parallel: true,
        // Enable file caching
        cache: true,
      }),
    ]),

    ...(Array.isArray(config) ? config : [customConfig(config)]),
  ])
}

module.exports = accuPreset
