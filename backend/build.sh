set -o errexit


pip install -r backend/requirements.txt


cd landing_page
npm install
npm run build
cd ..
