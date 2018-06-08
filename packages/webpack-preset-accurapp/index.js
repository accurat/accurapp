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
  when,
} = require('@webpack-blocks/webpack')
const { css } = require('@webpack-blocks/assets')
const devServer = require('@webpack-blocks/dev-server')
const eslint = require('@webpack-blocks/eslint')
const autoprefixer = require('autoprefixer')
const nested = require('postcss-nested')
const fuss = require('postcss-fuss')
const fussFunctions = require('postcss-fuss/fuss-functions')
const colorModFunction = require('postcss-color-mod-function')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const Dotenv = require('dotenv-webpack')

const {
  babel,
  postcss,
  extractCss,
  imageLoader,
  videoLoader,
  fontLoader,
  glslifyLoader,
  csvLoader,
  svgLoader,
  json5Loader,
  resolveSrc,
  prependEntry,
  mode,
  uglify,
  optimization,
} = require('./customBlocks')

function buildWebpackConfig(config = []) {
  const cssOptions = {
    minimize: process.env.NODE_ENV === 'production',
    sourceMap: process.env.GENERATE_SOURCEMAP === 'true',
    ...(process.env.NODE_ENV === 'production' && { styleLoader: false }),
  }
  const postcssOptions = {
    plugins: [
      autoprefixer({ flexbox: 'no-2009' }),
      nested,
      fuss({ functions: fussFunctions }),
      colorModFunction(),
    ],
  }

  return createConfig([
    entryPoint('./src/index.js'),

    // Loaders
    match(['*.css', '!*.module.css'], [
      when(process.env.NODE_ENV === 'production', [
        extractCss(),
      ]),
      css(cssOptions),
      postcss(postcssOptions),
    ]),
    match('*.module.css', [
      when(process.env.NODE_ENV === 'production', [
        extractCss(),
      ]),
      css.modules(cssOptions),
      postcss(postcssOptions),
    ]),
    match(['*.{js,jsx}', '!*node_modules*'], [
      babel(),
    ]),
    // Only transpile the latest stable ECMAScript features from node_modules.
    // This is because some node_modules may be written in a newer ECMAScript
    // version than the browsers you're actially supporting
    when(process.env.TRANSPILE_NODE_MODULES === 'true', [
      match('*.js', { include: /node_modules/ }, [
        babel({
          babelrc: false,
          presets: [
            ['@babel/preset-env', { modules: false }],
          ],
        }),
      ]),
    ]),
    fontLoader(),
    imageLoader(),
    videoLoader(),
    glslifyLoader(),
    csvLoader(),
    // svgLoader(),
    json5Loader(),

    // Import components without doing the ../../../
    resolveSrc(),

    optimization({
      // Automatically split vendor and app code
      // https://twitter.com/wSokra/status/969633336732905474
      splitChunks: {
        chunks: 'all',
        name: 'vendors',
      },
    }),

    addPlugins([
      // Like webpack.DefinePlugin, but also reads the .env file, giving however priority to
      // the envs already there (like NODE_ENV or variable set from the command line or CI).
      // Also it reads the .env.example if executed during a CI
      new Dotenv({
        systemvars: true,
        silent: true,
        safe: process.env.CI === 'true',
      }),
      // Generates an `index.html` file with the <script> injected.
      new HtmlWebpackPlugin({
        inject: true,
        template: './src/index.html',
      }),
      // Makes some environment variables available in index.html. Example: %PUBLIC_URL%
      new InterpolateHtmlPlugin({
        'NODE_ENV': process.env.NODE_ENV,
        'PUBLIC_URL': process.env.PUBLIC_URL,
      }),
      // Check case of paths, so case-sensitive filesystems won't complain:
      new CaseSensitivePathsPlugin(),
    ]),

    //
    //  $$$$$$\    $$$$$$$$\     $$$$$$\     $$$$$$$\    $$$$$$$$\
    // $$  __$$\   \__$$  __|   $$  __$$\    $$  __$$\   \__$$  __|
    // $$ /  \__|     $$ |      $$ /  $$ |   $$ |  $$ |     $$ |
    // \$$$$$$\       $$ |      $$$$$$$$ |   $$$$$$$  |     $$ |
    //  \____$$\      $$ |      $$  __$$ |   $$  __$$<      $$ |
    // $$\   $$ |     $$ |      $$ |  $$ |   $$ |  $$ |     $$ |
    // \$$$$$$  |     $$ |      $$ |  $$ |   $$ |  $$ |     $$ |
    //  \______/      \__|      \__|  \__|   \__|  \__|     \__|
    //
    env('development', [
      mode('development'),
      setOutput({
        publicPath: '/',
      }),
      prependEntry('react-dev-utils/webpackHotDevClient'),
      devServer({
        compress: true,
        clientLogLevel: 'none',
        contentBase: './public/',
        publicPath: '/',
        watchContentBase: true,
        quiet: true,
        watchOptions: {
          ignored: /node_modules/,
        },
        overlay: false,
      }),
      eslint(),
      addPlugins([
        // Automatic rediscover of packages after `npm install`
        new WatchMissingNodeModulesPlugin('node_modules'),
      ]),
      // Faster 'cheap-module-source-map' sourcemaps in development
      sourceMaps('cheap-module-source-map'),
      // Turn off performance hints during development
      performance(false),
    ]),

    //
    // $$$$$$$\     $$\   $$\    $$$$$$\    $$\          $$$$$$$\
    // $$  __$$\    $$ |  $$ |   \_$$  _|   $$ |         $$  __$$\
    // $$ |  $$ |   $$ |  $$ |     $$ |     $$ |         $$ |  $$ |
    // $$$$$$$\ |   $$ |  $$ |     $$ |     $$ |         $$ |  $$ |
    // $$  __$$\    $$ |  $$ |     $$ |     $$ |         $$ |  $$ |
    // $$ |  $$ |   $$ |  $$ |     $$ |     $$ |         $$ |  $$ |
    // $$$$$$$  |   \$$$$$$  |   $$$$$$\    $$$$$$$$\    $$$$$$$  |
    // \_______/     \______/    \______|   \________|   \_______/
    //
    env('production', [
      mode('production'),
      setOutput({
        path: path.resolve('./build'),
        filename: 'app.[contenthash:8].js',
        chunkFilename: '[name].[contenthash:8].chunk.js',
        publicPath: `${process.env.PUBLIC_URL}/`,
      }),

      addPlugins([
        // Extract the css and import it from the <head>,
        // this prevents the Flash Of Unstyled Content that could happen
        // when leaving css inside the javascript
        new MiniCssExtractPlugin({
          filename: 'app.[contenthash:8].css',
          chunkFilename: '[name].[contenthash:8].chunk.css',
        }),
      ]),

      // Use sourcemaps only if specified, like in staging,
      // don't use them by default when building
      when(process.env.GENERATE_SOURCEMAP === 'true', [
        sourceMaps('source-map'),
      ]),

      uglify({
        uglifyOptions: {
          parse: {
            // we want uglify-js to parse ecma 8 code. However, we don't want it
            // to apply any minfication steps that turns valid ecma 5 code
            // into invalid ecma 5 code. This is why the 'compress' and 'output'
            // sections only apply transformations that are ecma 5 safe
            // https://github.com/facebook/create-react-app/pull/4234
            ecma: 8,
          },
          compress: {
            ecma: 5,
            // Remove all console.logs
            drop_console: process.env.GENERATE_SOURCEMAP !== 'true',
            // Disabled because of an issue with Uglify breaking seemingly valid code:
            // https://github.com/facebook/create-react-app/issues/2376
            // Pending further investigation:
            // https://github.com/mishoo/UglifyJS2/issues/2011
            comparisons: false,
          },
          output: {
            ecma: 5,
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
        // Uglification in staging is alright because we have sourcemaps
        // that show the original code
        sourceMap: process.env.GENERATE_SOURCEMAP === 'true',
      }),
    ]),

    ...(Array.isArray(config) ? config : [customConfig(config)]),
  ])
}

module.exports = {
  buildWebpackConfig,
}
