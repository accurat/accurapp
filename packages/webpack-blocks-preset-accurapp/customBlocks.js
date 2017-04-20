// you're able to import starting from the src folder so you don't have to ../../../
export function resolveSrc() {
  return () => ({
    resolve: {
      modules: ['node_modules', 'src'],
    },
  })
}

// GLSLify is a node-style module system for GLSL
// allowing you to install GLSL modules from npm and use them in your shaders.
export function glslifyLoader() {
  return () => ({
    module: {
      loaders: [ // TODO change this in rules when webpack-blocks 1.0 is out
        {
          test: /\.(glsl|frag|vert)$/,
          loaders: ['raw-loader', 'glslify-loader'],
        }
      ]
    }
  })
}
