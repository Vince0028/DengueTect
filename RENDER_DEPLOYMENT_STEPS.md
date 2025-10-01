# Render Deployment Steps

## Manual Configuration (Recommended)

Since the automatic YAML configuration is having issues, follow these manual steps:

### 1. Create Web Service
1. Go to [render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository: `Vince0028/DengueTect`

### 2. Configure Build Settings
- **Build Command**: `pip install -r requirements.txt && python migrate.py`
- **Start Command**: `gunicorn --bind 0.0.0.0:$PORT app_supabase:app`

### 3. Environment Variables
Add these in the Render dashboard:
```
DATABASE_URL=postgresql://postgres.xucfvwescuherubfosww:dengeutech0028006@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
SECRET_KEY=[Click "Generate" button in Render]
FLASK_DEBUG=false
```

### 4. Advanced Settings
- **Python Version**: 3.11
- **Health Check Path**: `/`

### 5. Deploy
Click "Create Web Service" and wait for deployment.

## Troubleshooting

If you still get `web:: command not found`:

1. **Check the Start Command**: Make sure it's exactly:
   ```
   gunicorn --bind 0.0.0.0:$PORT app_supabase:app
   ```

2. **Remove Procfile**: Delete the `Procfile` from your repository if it's causing conflicts

3. **Use Manual Configuration**: Don't use `render.yaml`, configure everything manually in the Render dashboard

## Alternative: Simple Procfile Only

If manual configuration doesn't work, try this minimal setup:

1. Keep only the `Procfile` with:
   ```
   web: gunicorn --bind 0.0.0.0:$PORT app_supabase:app
   ```

2. Set Build Command manually in Render dashboard:
   ```
   pip install -r requirements.txt && python migrate.py
   ```

3. Let Render auto-detect the start command from Procfile
