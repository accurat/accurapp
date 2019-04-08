const path = require('path')
const fs = require('fs-extra')
const resolve = require('resolve')
const globby = require('globby').sync
const { log, exec } = require('./logging-utils')

const defaultTsConfig = {
  compilerOptions: {
    target: 'es5',
    lib: ['esnext', 'dom', 'dom.iterable'],
    module: 'esnext',
    moduleResolution: 'node',
    esModuleInterop: true,
    allowJs: true,
    allowSyntheticDefaultImports: true,
    resolveJsonModule: true,
    skipLibCheck: true,
    sourceMap: true,
    jsx: 'react',
    strict: true,
    // already enabled by strict: true
    // noImplicitThis: true,
    // noImplicitAny: true,
    strictNullChecks: false,
    noImplicitReturns: true,
    suppressImplicitAnyIndexErrors: true,
    noUnusedLocals: false,
    forceConsistentCasingInFileNames: true,
    experimentalDecorators: true,
  },
  include: ['src'],
}

function areThereTypescriptFiles(dir) {
  const typescriptFiles = globby(['**/*.(ts|tsx)', '!**/node_modules', '!**/*.d.ts'], {
    cwd: dir,
  })

  return typescriptFiles.length > 0
}

function verifyTypeScriptSetup(appDir, { shouldInstall = true } = {}) {
  if (!appDir) {
    throw new Error('Missing path argument to verifyTypeScriptSetup')
  }

  const appTsConfig = path.resolve(appDir, 'tsconfig.json')
  const appTypes = path.resolve(appDir, 'src/types.d.ts')
  const appNodeModules = path.resolve(appDir, 'node_modules')
  const appSrc = path.resolve(appDir, 'src')

  if (!areThereTypescriptFiles(appSrc)) {
    return
  }

  if (!fs.existsSync(appTsConfig)) {
    log.ok(`Creating tsconfig.json`)
    fs.writeFileSync(appTsConfig, `${JSON.stringify(defaultTsConfig, null, 2)}\n`)
  }

  if (!fs.existsSync(appTypes)) {
    log.ok(`Creating types.d.ts`)
    fs.writeFileSync(appTypes, '/// <reference types="accurapp-scripts" />\n')
  }

  if (shouldInstall) {
    try {
      resolve.sync('typescript', { basedir: appNodeModules })
    } catch (e) {
      log.ok(`Installing latest version of typescript`)
      exec(
        'yarn add --dev typescript @types/react @types/react-dom @types/node @types/webpack-env @types/lodash',
        appDir
      )
    }
  }
}

module.exports = { verifyTypeScriptSetup }
