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
BROWSER=false yarn start &
PID=$!
sleep 20s
kill $PID

# Test the build command
yarn build

## Enable typescript
rm ./src/components/App.js
mv ./src/index.js ./src/index.tsx
cp -r ../.fixtures/test-app-ts/src .
yarn add @types/mapbox-gl

# Test the start with typescript
BROWSER=false yarn start &
PID=$!
sleep 20s
kill $PID

# Test the build with typescript
yarn build

echo
echo '____________________________'
echo '   ✅ All tests passed ✅'
echo '----------------------------'
echo