const path = require('path')
const fs = require('fs-extra')
const resolve = require('resolve')
const globby = require('globby').sync
const { log, exec } = require('./logging')

const defaultTsConfig = {
  compilerOptions: {
    target: 'es5',
    lib: ['esnext', 'dom', 'dom.iterable'],
    module: 'esnext',
    moduleResolution: 'node',
    allowJs: true,

    // Accurat old ts config
    // baseUrl: '.',
    // rootDir: '.',
    // outDir: 'build',
    // sourceMap: true,
    // jsx: 'react',
    // forceConsistentCasingInFileNames: true,
    // noImplicitReturns: true,
    // noImplicitThis: true,
    // noImplicitAny: true,
    // strictNullChecks: false,
    // suppressImplicitAnyIndexErrors: true,
    // noUnusedLocals: false,
    // experimentalDecorators: true,

    // React ts config
    skipLibCheck: true,
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    strict: true,
    resolveJsonModule: true,
    isolatedModules: true,
    noEmit: true,
    jsx: 'preserve',
  },
  include: ['src'],
}

function areThereTypescriptFiles(dir) {
  const typescriptFiles = globby(['**/*.(ts|tsx)', '!**/node_modules', '!**/*.d.ts'], {
    cwd: dir,
  })

  return typescriptFiles.length > 0
}

function verifyTypeScriptSetup(appDir) {
  const appTsConfig = path.resolve(appDir, 'tsconfig.json')
  const appNodeModules = path.resolve(appDir, 'node_modules')
  const appSrc = path.resolve(appDir, 'src')

  if (!areThereTypescriptFiles(appSrc)) {
    return
  }

  if (!fs.existsSync(appTsConfig)) {
    log.ok(`Creating tsconfig.json`)
    fs.writeFileSync(appTsConfig, `${JSON.stringify(defaultTsConfig, null, 2)}\n`)
  }

  try {
    resolve.sync('typescript', { basedir: appNodeModules })
  } catch (e) {
    log.ok(`Installing latest version of typescript`)
    exec('yarn add --dev typescript')
  }

  // Reference `react-scripts` types
  // if (!fs.existsSync(paths.appTypeDeclarations)) {
  //   fs.writeFileSync(paths.appTypeDeclarations, `/// <reference types="react-scripts" />${os.EOL}`)
  // }
}

module.exports = { verifyTypeScriptSetup }
