const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')

// TODO use contenthash when this issue will be resolved
// https://github.com/webpack/loader-utils/issues/112
const fileNameTemplate = '[name].[hash:8].[ext]'

const babelLoaderOptions = {
  compact: process.env.NODE_ENV === 'production',
  cacheDirectory: true,
  // Don't waste time on Gzipping the cache during dev
  cacheCompression: process.env.NODE_ENV === 'production',
}

/**
 * The thread-loader parallelizes code compilation, useful with babel since
 * it transpiles both application javascript and node_modules javascript
 */
function babel(options = {}) {
  return (context, { addLoader }) =>
    addLoader({
      // setting `test` defaults here, in case there is no `context.match` data
      test: /\.(js|jsx)$/,
      use: [
        {
          loader: 'thread-loader',
          options: {
            // Keep workers alive for more effective watch mode
            ...(process.env.NODE_ENV === 'development' && { poolTimeout: Infinity }),
          },
        },
        {
          loader: 'babel-loader',
          options: Object.assign(babelLoaderOptions, options),
        },
      ],
      ...context.match,
    })
}

/**
 * Extracts the css and puts it in the <head>
 */
function extractCss() {
  return (context, { addLoader }) =>
    addLoader({
      test: /\.css$/,
      use: [
        {
          loader: MiniCssExtractPlugin.loader,
        },
      ],
      ...context.match,
    })
}

/**
 * Applies postcss plugins transformations to the css
 * TODO remove this block when this PR will be resolved
 * https://github.com/andywer/webpack-blocks/pull/293
 */
function postcss(options = {}) {
  return (context, { addLoader }) =>
    addLoader({
      test: /\.css$/,
      use: [
        {
          loader: 'postcss-loader',
          options,
        },
      ],
      ...context.match,
    })
}

/**
 * Images smaller than 10kb are loaded as a base64 encoded url instead of file url
 */
function imageLoader() {
  return (context, { addLoader }) =>
    addLoader({
      test: /\.(gif|ico|jpg|jpeg|png|webp)$/,
      loader: 'url-loader',
      options: {
        limit: 10000,
        name: fileNameTemplate,
      },
    })
}

/**
 * Videos smaller than 10kb are loaded as a base64 encoded url instead of file url
 */
function videoLoader() {
  return (context, { addLoader }) =>
    addLoader({
      test: /\.(mp4|webm)$/,
      loader: 'url-loader',
      options: {
        limit: 10000,
        name: fileNameTemplate,
      },
    })
}

/**
 * Fonts are loaded as file urls
 */
function fontLoader() {
  return (context, { addLoader }) =>
    addLoader({
      test: /\.(eot|ttf|otf|woff|woff2)(\?.*)?$/,
      loader: 'file-loader',
      options: {
        name: fileNameTemplate,
      },
    })
}

/**
 * Pdfs are loaded as file urls
 */
function pdfLoader() {
  return (context, { addLoader }) =>
    addLoader({
      test: /\.pdf$/,
      loader: 'file-loader',
      options: {
        name: fileNameTemplate,
      },
    })
}

/**
 * GLSLify is a node-style module system for WebGL shaders,
 * allowing you to install GLSL modules from npm and use them in your shaders
 */
function glslifyLoader() {
  return (context, { addLoader }) =>
    addLoader({
      test: /\.(glsl|frag|vert)$/,
      use: ['raw-loader', 'glslify-loader'],
    })
}

/**
 * Parse .csv files with PapaParse and return it in a JSON format
 */
function csvLoader() {
  return (context, { addLoader }) =>
    addLoader({
      test: /\.csv$/,
      loader: 'csv-loader',
      options: {
        dynamicTyping: true,
        header: true,
        skipEmptyLines: true,
      },
    })
}

// Allows you to use two kinds of imports for SVG:
// import logoUrl from './logo.svg'; gives you the URL.
// import { ReactComponent as Logo } from './logo.svg'; gives you a component.
function reactSvgLoader() {
  return (context, { addLoader }) =>
    addLoader({
      test: /\.svg$/,
      use: [
        {
          loader: 'babel-loader',
          options: babelLoaderOptions,
        },
        {
          loader: '@svgr/webpack',
          options: {
            svgProps: {
              fill: 'currentColor',
            },
            titleProp: true,
            svgoConfig: {
              multipass: true,
              pretty: process.env.NODE_ENV === 'development',
              indent: 2,
              plugins: [
                { sortAttrs: true },
                { removeViewBox: false },
                { removeDimensions: true },
                { convertColors: { currentColor: true } },
                { cleanupIDs: { minify: false } },
              ],
            },
          },
        },
        {
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: fileNameTemplate,
          },
        },
      ],
    })
}

/**
 * Suppot .json5 files https://json5.org/
 */
function json5Loader() {
  return (context, { addLoader }) =>
    addLoader({
      test: /\.json5$/,
      loader: 'json5-loader',
    })
}

/**
 * You will be able to import starting from the src folder so you don't have to ../../../
 */
function resolveSrc() {
  return (context, { merge }) =>
    merge({
      resolve: {
        modules: ['node_modules', 'src'],
      },
    })
}

/**
 * Terser is a mantained fork of uglify-js
 * https://twitter.com/devongovett/status/1013127516943314944
 */
function terser(options) {
  return (context, { merge }) =>
    merge({
      optimization: {
        minimizer: [new TerserPlugin(options)],
      },
    })
}

/**
 * Add entryPoint at beginning of 'entry' array
 */
function prependEntry(entry) {
  const blockFunction = (context, util) => {
    if (!context.entriesToPrepend) context.entriesToPrepend = []
    context.entriesToPrepend.unshift(entry)
    return config => config
  }
  return Object.assign(blockFunction, {
    post: prependEntryPostHook,
  })
}
function prependEntryPostHook(context, util) {
  return config => {
    config.entry.main.unshift(...context.entriesToPrepend)
    return config
  }
}

/**
 * Adds one or multiple entry points.
 */
function entryPoint(entry) {
  return (context, util) => util.merge({ entry })
}

module.exports = {
  fileNameTemplate,
  babel,
  postcss,
  extractCss,
  imageLoader,
  videoLoader,
  fontLoader,
  pdfLoader,
  glslifyLoader,
  csvLoader,
  reactSvgLoader,
  json5Loader,
  resolveSrc,
  terser,
  prependEntry,
  entryPoint,
}
