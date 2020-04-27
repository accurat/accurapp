#!/bin/bash

# Exit on errors
set -e

# Go to root path even if script is run from somewhere else
cd "$(dirname "$0")"
cd ..

# Create the test-app!
yarn create-test-app

cd test-app/

# Test the start of the application
BROWSER=false PORT=9999 yarn start &
sleep 20s
fkill :9999

# Test the build command
yarn build

# Test the test command
yarn test --watch=false

## Enable typescript
rm ./src/components/App.js
rm ./src/myawesome.worker.js
mv ./src/index.js ./src/index.tsx
mv ./src/components/App.test.js ./src/components/App.test.ts
cp -r ../.fixtures/test-app-ts/src .

# Test the start with typescript
BROWSER=false PORT=9999 yarn start &
sleep 30s
fkill :9999

# Test the build with typescript
yarn build

# Test the test command with typescript
yarn test --watch=false

echo
echo '____________________________'
echo '   ✅ All tests passed ✅'
echo '----------------------------'
echo