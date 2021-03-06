const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')

const fileNameTemplate = '[name].[contenthash:8].[ext]'

/**
 * Simple babel-loader. The @webpack-blocks/babel shares the babel config in the context, which was giving us problems.
 */
function babel(options = {}) {
  return (context, { addLoader }) =>
    addLoader({
      // setting `test` defaults here, in case there is no `context.match` data
      test: /\.(js|jsx)$/,
      use: [
        {
          loader: 'babel-loader',
          options,
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
// import { ReactComponent as Logo } from './logo.colors.svg'; gives you a component keeping its colors.
function reactSvgLoader() {
  return (context, { addLoader }) =>
    addLoader({
      test: /\.svg$/,
      exclude: /colors\.svg$/,
      issuer: {
        test: /\.(js|jsx|ts|tsx)$/,
      },
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            memo: true,
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
function reactColorSvgLoader(options = {}) {
  return (context, { addLoader }) =>
    addLoader({
      test: /colors\.svg$/,
      issuer: {
        test: /\.(js|jsx|ts|tsx)$/,
      },
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            titleProp: true,
            svgoConfig: {
              multipass: true,
              pretty: process.env.NODE_ENV === 'development',
              indent: 2,
              ref: true,
              plugins: [
                { sortAttrs: true },
                { inlineStyles: { onlyMatchedOnce: false } },
                { removeViewBox: false },
                { removeDimensions: true },
                { cleanupIDs: false },
                { prefixIds: false },
                { mergePaths: false },
              ],
            },
            ...options,
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
 * Url-loader for svgs in css
 */
function cssSvgLoader() {
  return (context, { addLoader }) =>
    addLoader({
      // This needs to be different form the reactSvgLoader, otherwise it will merge
      test: /(.*)\.svg$/,
      issuer: {
        test: /\.css$/,
      },
      loader: 'url-loader',
      options: {
        limit: 10000,
        name: fileNameTemplate,
      },
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
 * Import workers like any other module.
 */
function workerLoader() {
  return (context, { addLoader }) =>
    addLoader({
      test: /\.worker\.(js|ts)$/,
      loader: 'worker-loader',
      enforce: 'post',
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
 * Import also typescript without specifying the extension
 */
function resolveTs() {
  return (context, { merge }) =>
    merge({
      resolve: {
        extensions: ['.ts', '.tsx'],
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

module.exports = {
  fileNameTemplate,
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
}
