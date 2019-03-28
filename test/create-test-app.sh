#!/bin/bash

# Exit on errors
set -e

# Go to root path even if script is run from somewhere else
cd "$(dirname "$0")"
cd ..

# Clean the test folder (do nothing if it was already deleted)
rm -rf test-app || true

# Create the test-app!
node ./packages/create-accurapp test-app --testing

# Copy fixtures and install eventual new dependencies
cp -r .fixtures/test-app .
cd test-app/
yarn