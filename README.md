# AccurApp

This is a fork of [create-react-app](https://github.com/facebookincubator/create-react-app/)
for the specific needs of Accurat.

## Getting started:

Add globally the binary that will be used to build a new project directory structure, installing all dependencies.

```sh
yarn global add create-accurapp
create-accurapp project-name
```

## Original documentation:
- [Getting Started](https://github.com/facebookincubator/create-react-app/#getting-started)
- [User Guide](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md)

## Customizations:
- ESLint config is the one configured for Accurat, `eslint-config-accurapp`
- Babel presets are changed to `stage-0` and `latest` with decorators support
- GLSL webpack loader, to import shaders and require shaders within shaders
