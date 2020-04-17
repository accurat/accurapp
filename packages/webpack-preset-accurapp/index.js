const fs = require('fs')
const path = require('path')
const {
  createConfig,
  addPlugins,
  customConfig,
  setOutput,
  env,
  performance,
  sourceMaps,
  match,
  when,
  setMode,
  optimization,
  entryPoint,
} = require('@webpack-blocks/webpack')
const { css } = require('@webpack-blocks/assets')
const devServer = require('@webpack-blocks/dev-server')
const eslint = require('@webpack-blocks/eslint')
const postcss = require('@webpack-blocks/postcss')
const postcssPresetEnv = require('postcss-preset-env')
const nested = require('postcss-nested')
const fuss = require('postcss-fuss')
const fussFunctions = require('postcss-fuss/fuss-functions')
const colorModFunction = require('postcss-color-mod-function')
const cssnano = require('cssnano')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin')
const ModuleNotFoundPlugin = require('react-dev-utils/ModuleNotFoundPlugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const typescriptFormatter = require('react-dev-utils/typescriptFormatter')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const Dotenv = require('dotenv-webpack')

const {
  babel,
  extractCss,
  imageLoader,
  videoLoader,
  fontLoader,
  pdfLoader,
  glslifyLoader,
  csvLoader,
  reactSvgLoader,
  reactColorSvgLoader,
  cssSvgLoader,
  json5Loader,
  workerLoader,
  resolveSrc,
  resolveTs,
  terser,
  prependEntry,
} = require('./customBlocks')

const appDir = process.cwd()
const useTypescript = fs.existsSync(`${appDir}/tsconfig.json`)
const babelrc = JSON.parse(fs.readFileSync(`${appDir}/.babelrc`))

// Inject the typescript option
if (useTypescript) {
  babelrc.presets = [
    ...babelrc.presets.filter(p => p !== 'accurapp'),
    ['accurapp', { typescript: true }],
  ]
}

const cssOptions = {
  // BUG
  // Disabled during development because otherwise it would FOUC
  sourceMap: process.env.GENERATE_SOURCEMAP === 'true' && process.env.NODE_ENV !== 'development',
  ...(process.env.NODE_ENV === 'production' && { styleLoader: false }),
}

const postcssOptions = {
  plugins: [
    postcssPresetEnv({
      autoprefixer: { flexbox: 'no-2009' },
      stage: 0,
      features: {
        // postcss-nested is better than postcss-nesting
        'nesting-rules': false,
      },
    }),
    nested,
    fuss({ functions: fussFunctions }),
    colorModFunction(),
    ...(process.env.NODE_ENV === 'production' ? [cssnano()] : []),
  ],
}

const babelOptions = {
  cacheDirectory: true,
  compact: process.env.NODE_ENV === 'production',
  // Disable cacheCompression because it's not that useful
  // https://github.com/facebook/create-react-app/pull/7633
  cacheCompression: false,
  // https://github.com/zloirock/core-js/issues/743#issuecomment-608022407
  exclude: [/\bcore-js\b/, /\bwebpack\/buildin\b/],
}

function buildWebpackConfig(config = []) {
  return createConfig([
    entryPoint(useTypescript ? './src/index.tsx' : './src/index.js'),

    // Loaders
    match(
      ['*.css', '!*.module.css'],
      [
        when(process.env.NODE_ENV === 'production', [extractCss()]),
        css(cssOptions),
        postcss(postcssOptions),
      ]
    ),
    match('*.module.css', [
      when(process.env.NODE_ENV === 'production', [extractCss()]),
      css.modules(cssOptions),
      postcss(postcssOptions),
    ]),
    match('*.{js,jsx,ts,tsx}', { exclude: /node_modules/ }, [
      babel({
        ...babelOptions,
        // Fix because it's reading the wrong .babelrc somehow
        babelrc: false,
        ...babelrc,
      }),
    ]),
    when(process.env.TRANSPILE_NODE_MODULES === 'true', [
      // mapbox-gl excluded because of
      // https://github.com/mapbox/mapbox-gl-js/issues/4359
      // BUG
      // somehow this config is used also for the main application code 🤔
      match('*.{js,jsx,ts,tsx}', { include: /node_modules/, exclude: /(core-js|mapbox-gl)/ }, [
        babel({
          ...babelOptions,
          // needed to use the polyfill useBuildIns: 'usage'
          // https://stackoverflow.com/questions/52407499
          sourceType: 'unambiguous',
          // Fix because it's reading the wrong .babelrc somehow
          babelrc: false,
          ...babelrc,
        }),
      ]),
    ]),
    // Order is important!! Don't remember why 🤔
    fontLoader(),
    imageLoader(),
    cssSvgLoader(),
    videoLoader(),
    glslifyLoader(),
    pdfLoader(),
    csvLoader(),
    json5Loader(),
    workerLoader(),
    reactSvgLoader(),
    reactColorSvgLoader({ typescript: useTypescript }),

    // Needed for the worker-loader.
    setOutput({ globalObject: 'this' }),

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
      // the envs already there (like variable set from the command line or CI).
      new Dotenv({
        systemvars: true,
        silent: true,
        safe: process.env.CI !== 'true',
      }),
      // Generates an `index.html` file with the <script> injected.
      new HtmlWebpackPlugin({
        inject: true,
        template: './src/index.html',
      }),
      // Makes some environment variables available in index.html. Example: %PUBLIC_URL%
      new InterpolateHtmlPlugin(HtmlWebpackPlugin, {
        NODE_ENV: process.env.NODE_ENV,
        PUBLIC_URL: process.env.PUBLIC_URL,
      }),
      // Check case of paths, so case-sensitive filesystems won't complain:
      new CaseSensitivePathsPlugin(),
      // This gives some necessary context to module not found errors, such as
      // the requesting resource.
      new ModuleNotFoundPlugin(process.cwd()),
    ]),

    when(useTypescript, [
      // Import typescript components without specifying .ts or .tsx
      resolveTs(),

      // Typescript fast typechecker
      addPlugins([
        useTypescript &&
          new ForkTsCheckerWebpackPlugin({
            async: process.env.NODE_ENV === 'development',
            useTypescriptIncrementalApi: true,
            checkSyntacticErrors: true,
            reportFiles: [
              '**',
              '!**/__tests__/**',
              '!**/?(*.)test.*',
            ],
            silent: true,
            // The formatter is invoked directly in WebpackDevServerUtils during development
            formatter: process.env.NODE_ENV === 'production' ? typescriptFormatter : undefined,
          }),
      ]),
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
      setMode('development'),
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
          ignored: process.env.WATCH_NODE_MODULES === 'true' ? undefined : /node_modules/,
        },
        overlay: false,
        disableHostCheck: true,
      }),
      eslint({
        cache: true,
      }),
      addPlugins([
        // Automatic rediscover of packages after `npm install`
        new WatchMissingNodeModulesPlugin('node_modules'),
      ]),
      // Faster 'cheap-module-source-map' sourcemaps in development
      sourceMaps('cheap-module-source-map'),
      // Turn off performance hints during development
      performance(false),
      // Fix "webpackHotUpdate is not defined" issue
      // https://github.com/webpack/webpack/issues/6693
      optimization({
        runtimeChunk: true,
      }),
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
      setMode('production'),
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
      when(process.env.GENERATE_SOURCEMAP === 'true', [sourceMaps('source-map')]),

      terser({
        terserOptions: {
          parse: {
            // we want terser to parse ecma 8 code. However, we don't want it
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
  cssOptions,
  postcssOptions,
}

// RegExp.prototype.toJSON = RegExp.prototype.toString
// console.log('----------------------------------------------------------------------------------')
// console.log(JSON.stringify(buildWebpackConfig(), null, 2))
// console.log('----------------------------------------------------------------------------------')
