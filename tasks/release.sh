#!/bin/bash

# Exit the script on any command with non 0 return code
set -e
# Echo every command being executed
set -x

cd "$(dirname "$0/..")"

# Check npm version
if [ $(npm -v | head -c 1) -lt 6 ]; then
  echo "Releasing requires npm >= 6. Aborting.";
  exit 1;
fi;

if [ -n "$(git status --porcelain)" ]; then
  echo "Your git status is not clean. Aborting.";
  exit 1;
fi

# Go!
./node_modules/.bin/lerna publish --independent "$@"
