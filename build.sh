#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install Python dependencies
pip install -r requirements.txt

# Build the React landing page
cd landing_page
npm install
npm run build
cd ..
