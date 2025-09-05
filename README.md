# DengueTect (Flask port)

This is a lightweight Flask port of the original Next.js app so you can run it with Python.

## Prerequisites
- Python 3.10+ installed

## Setup
```powershell
# From the project root
py -m pip install -r requirements.txt
```

## Run
```powershell
py app.py
```

The app will start on http://127.0.0.1:5000

## Notes
- Static assets (images, etc.) are served from the existing `public/` directory. For example, `/images/dengue-logo.png`.
- This port focuses on structure and navigation parity (Login → Dashboard → features). Styling is simplified via `public/css/styles.css`.
- Pages implemented:
  - `/` (login)
  - `/dashboard`
  - `/education`
  - `/report-bite`
  - `/bite-analysis-result`
  - `/risk-assessment`
  - `/symptom-checker`
  - `/profile`
  - `/settings`

If you want feature parity (e.g., AI analysis), we can wire backend endpoints to real models next.
