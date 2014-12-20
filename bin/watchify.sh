#!/usr/bin/env bash

# This script assumes that watchify is installed globally. To do that execute
# npm install -g watchify

# Three watchify processes are started in the background. Use
# pkill -f watchify or pkill -f "node.*watchify"
# to stop them.

bin_path=`dirname $0`
pushd $bin_path/.. > /dev/null

watchify \
  --entry index.js \
  --outfile browser/dist/traverson-hal.js \
  --standalone TraversonJsonHalAdapter \
  --debug \
  --verbose \
  &

watchify \
  --entry index.js \
  --outfile browser/dist/traverson-hal.external.js \
  --require ./index \
  --debug \
  --verbose \
  &

watchify \
  --entry test/browser_suite.js \
  --outfile browser/test/browserified_tests.js \
  --external ./index.js
  --debug \
  --verbose \
  &

popd > /dev/null
