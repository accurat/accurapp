const fileNameTemplate = '[name].[hash:8].[ext]'

/**
 * Images smaller than 10kb are loaded as a base64 encoded url instead of file url
 */
function imageLoader() {
  return (context, { addLoader }) => addLoader({
    test: /\.(gif|ico|jpg|jpeg|png|webp)$/,
    use: ['url-loader'],
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
    use: ['url-loader'],
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
    test: /\.(eot|ttf|woff|woff2)(\?.*)?$/,
    use: ['file-loader'],
    options: {
      name: fileNameTemplate,
    },
  })
}

/**
 * GLSLify is a node-style module system for WebGL shaders,
 * allowing you to install GLSL modules from npm and use them in your shaders.
 */
function glslifyLoader() {
  return (context, { addLoader }) => addLoader({
    test: /\.(glsl|frag|vert)$/,
    use: ['raw-loader', 'glslify-loader'],
  })
}

/**
 * Run ESLint on every required file.
 */
function eslintLoader() {
  return (context, { addLoader }) => addLoader({
    test: /\.(js|jsx)$/,
    enforce: 'pre', // It's important to do this before Babel processes the JS.
    exclude: /node_modules/,
    use: ['eslint-loader'],
    options: { useEslintrc: true },
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
  const blockFunction = (context, config) => {
    if (!context.entriesToPrepend) context.entriesToPrepend = []
    context.entriesToPrepend.unshift(entry)
  }
  return Object.assign(blockFunction, {
    post: prependEntryPostHook,
  })
}
function prependEntryPostHook(context, config) {
  config.entry.main.unshift(...context.entriesToPrepend)
}

module.exports = {
  imageLoader,
  videoLoader,
  fontLoader,
  glslifyLoader,
  eslintLoader,
  resolveSrc,
  prependEntry,
}
