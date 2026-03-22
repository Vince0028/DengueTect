set -o errexit

# Prevent Vite build from running out of memory on Render's Free Tier (512MB limit)
export NODE_OPTIONS="--max-old-space-size=400"

pip install -r backend/requirements.txt


cd landing_page
npm install
npm run build
cd ..
