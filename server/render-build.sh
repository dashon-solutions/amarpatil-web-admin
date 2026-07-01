#!/usr/bin/env bash
# Exit on error
set -o errexit

# Run standard npm install
npm install

# Install Puppeteer browsers
npx puppeteer browsers install chrome

# (Optional) If you get "error while loading shared libraries", uncomment the lines below to install Chrome OS dependencies on Render
# apt-get update
# apt-get install -y wget gnupg
# apt-get install -y libxss1 libappindicator1 libindicator7 libasound2 libatk-bridge2.0-0 libgtk-3-0 libgbm-dev
