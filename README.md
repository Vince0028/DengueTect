# DengueTect (Flask port)

This is a lightweight Flask port of the original Next.js app so you can run it with Python.

## Prerequisites
- Python 3.10+ installed

## Setup
```powershell
# From the project root
py -m pip install -r requirements.txt
```

## Landing Page (No Build Needed)
The root route `/` serves a fully static HTML landing page (`templates/landing_static.html`) styled with Tailwind CDN. No Node / npm or build step required. Run the Flask app and open the root URL.

## Run
```powershell
py app.py
```

The app will start on http://127.0.0.1:5000

## Notes
- Landing page: `/` (static template `landing_static.html`).
- Login page moved to: `/login` (supports GET + POST). Existing redirects now point to `/login`.
- Static assets (images, uploads) remain in `public/`. Vite build assets are served from `landing_page/dist/assets` via the `/assets/...` route.
- Pages implemented:
  - `/` (React landing)
  - `/login` (auth form)
  - `/dashboard`
  - `/education`
  - `/report-bite`
  - `/bite-analysis-result`
  - `/risk-assessment`
  - `/symptom-checker`
  - `/profile`
  - `/settings`

