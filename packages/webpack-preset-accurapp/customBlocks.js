const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const fileNameTemplate = '[name].[contenthash:8].[ext]'

/**
 * The thread-loader parallelizes code compilation, useful with babel since
 * it transpiles both application javascript and node_modules javascript
 */
function babel(options = {}) {
  return (context, { addLoader }) => addLoader(
    Object.assign({
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
          options: Object.assign({
            compact: process.env.NODE_ENV === 'production',
            cacheDirectory: true,
            highlightCode: true,
          }, options),
        },
      ],
    }, context.match)
  )
}

/**
 * Applies postcss plugins transformations to the css
 * TODO remove this block when it will be updated in webpack-blocks
 */
function postcss(options = {}) {
  return (context, { addLoader }) => addLoader(
    Object.assign({
      test: /\.css$/,
      use: [
        {
          loader: 'postcss-loader',
          options,
        },
      ],
    }, context.match)
  )
}

/**
 * Extracts the css and puts it in the <head>
 * TODO use this also in development when this issue is fixed
 * https://github.com/webpack-contrib/mini-css-extract-plugin/issues/34
 */
function extractCss() {
  return (context, { addLoader }) => addLoader(
    Object.assign({
      test: /\.css$/,
      use: [
        {
          loader: MiniCssExtractPlugin.loader,
        },
      ],
    }, context.match)
  )
}

/**
 * Images smaller than 10kb are loaded as a base64 encoded url instead of file url
 */
function imageLoader() {
  return (context, { addLoader }) => addLoader({
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
  return (context, { addLoader }) => addLoader({
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
  return (context, { addLoader }) => addLoader({
    test: /\.(eot|ttf|otf|woff|woff2)(\?.*)?$/,
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
  return (context, { addLoader }) => addLoader({
    test: /\.(glsl|frag|vert)$/,
    use: ['raw-loader', 'glslify-loader'],
  })
}

/**
 * Parse .csv files with PapaParse and return it in a JSON format
 */
function csvLoader() {
  return (context, { addLoader }) => addLoader({
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
function svgLoader() {
  return (context, { addLoader }) => addLoader({
    test: /\.svg$/,
    use: [
      // {
      //   loader: 'babel-loader',
      //   options: {
      //     highlightCode: true,
      //     cacheDirectory: true,
      //     compact: process.env.NODE_ENV === 'production',
      //   },
      // },
      {
        loader: 'svgr/webpack',
        options: {
          // TODO uncomment this when this issue will be resolved
          // https://github.com/smooth-code/svgr/issues/52
          // svgo: {
          //   pretty: true,
          //   multipass: true,
          //   plugins: [
          //     { sortAttrs: true },
          //     { removeDimensions: true },
          //     { inlineStyles: true },
          //     { removeStyleElement: true },
          //     { convertColors: { currentColor: true } },
          //     { removeAttrs: { attrs: '(xmlns.*)' } },
          //   ],
          // },
          semi: false,
          singleQuote: true,
          trailingComma: 'es5',
          icon: true,
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
  return (context, { addLoader }) => addLoader({
    test: /\.json5$/,
    loader: 'json5-loader',
  })
}

/**
 * You will be able to import starting from the src folder so you don't have to ../../../
 */
function resolveSrc() {
  return (context, { merge }) => merge({
    resolve: {
      modules: ['node_modules', 'src'],
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
  return (config) => {
    config.entry.main.unshift(...context.entriesToPrepend)
    return config
  }
}

/**
 * Block for webpack4's mode and its options
 * TODO remove this block when it will be supported in webpack-blocks
 */
function mode(modeString, options = {}) {
  return (context, { merge }) => merge({
    mode: modeString,
    optimization: options,
  })
}

/**
 * Webpack4 uglify block
 * TODO remove this block when it will be supported in webpack-blocks
 */
function uglify(options = {}) {
  return (context, { merge }) => merge({
    optimization: {
      minimizer: [
        new UglifyJsPlugin(options),
      ],
    },
  })
}

/**
 * Block for webpack4's optimization config
 * TODO remove this block when it will be supported in webpack-blocks
 */
function optimization(options = {}) {
  return (context, { merge }) => merge({
    optimization: options,
  })
}

module.exports = {
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
}
