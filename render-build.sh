#!/usr/bin/env bash
set -o errexit

export PUPPETEER_CACHE_DIR=/opt/render/project/src/.cache/puppeteer
mkdir -p "$PUPPETEER_CACHE_DIR"

# Clean install
npm ci

# Install pinned Chrome build that matches current puppeteer version
npx puppeteer install chrome
