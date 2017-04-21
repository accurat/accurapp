/**
 * You will be able to import starting from the src folder so you don't have to ../../../
 */
function resolveSrc() {
  return () => ({
    resolve: {
      modules: ['node_modules', 'src'],
    },
  })
}

/**
 * GLSLify is a node-style module system for WebGL shaders,
 * allowing you to install GLSL modules from npm and use them in your shaders.
 */
function glslifyLoader() {
  return () => ({
    module: {
      loaders: [ // TODO change this in rules when webpack-blocks 1.0 is out
        {
          test: /\.(glsl|frag|vert)$/,
          loaders: ['raw-loader', 'glslify-loader'],
        },
      ],
    },
  })
}

/**
 * Run ESLint on every required file.
 */
function eslintLoader() {
  return () => ({
    module: {
      loaders: [{
        test: /\.(js|jsx)$/,
        enforce: 'pre', // It's important to do this before Babel processes the JS.
        exclude: [/node_modules/],
        loader: 'eslint-loader',
        options: { useEslintrc: true },
      }],
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
  resolveSrc,
  glslifyLoader,
  eslintLoader,
  prependEntry,
}
