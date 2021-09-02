#!/bin/bash
set -x
set -e

$NODE --experimental-specifier-resolution=node --loader ts-node/esm scripts/scrape.ts
$NODE --experimental-specifier-resolution=node --loader ts-node/esm scripts/process.ts
$NODE --loader ts-node/esm scripts/html.ts
rm -rf build
./node_modules/.bin/svelte-kit build && $NODE scripts/postbuild.js
gsutil -m rm -r gs://neovimcraft.com/*
gsutil -m -h 'Cache-Control:private, max-age=0, no-transform' rsync -r ./build gs://neovimcraft.com
