# DengueTect Deployment Guide

This guide will help you deploy the DengueTect system to Render using Supabase as the database.

## 🚀 Quick Start

### 1. Supabase Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and database password

2. **Run Database Migration**
   ```bash
   # Set environment variables
   export SUPABASE_URL="your-project-url.supabase.co"
   export SUPABASE_PASSWORD="your-database-password"
   
   # Run migration
   python migrate.py
   ```

### 2. Render Deployment

1. **Connect GitHub Repository**
   - Push your code to GitHub
   - Connect your repository to Render

2. **Create Web Service**
   - Choose "Web Service" in Render
   - Connect your GitHub repository
   - Use the following settings:
     - **Build Command**: `pip install -r requirements.txt && python migrate.py`
     - **Start Command**: `gunicorn --bind 0.0.0.0:$PORT app_supabase:app`
     - **Python Version**: 3.11

3. **Set Environment Variables**
   In Render dashboard, add these environment variables:
   ```
   DATABASE_URL=postgresql://postgres.xucfvwescuherubfosww:dengeutech0028006@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
   SECRET_KEY=your-secret-key-here (use Render's "Generate" button)
   FLASK_DEBUG=false
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for build to complete
   - Your app will be available at the provided URL

## 📁 File Structure

```
DengueTect/
├── app_supabase.py          # Main Flask app (Supabase version)
├── database.py              # SQLAlchemy models and database config
├── migrate.py               # Database migration script
├── denguetect_supabase_schema.sql  # Complete SQL schema
├── requirements.txt         # Python dependencies
├── render.yaml             # Render deployment config
├── Procfile               # Heroku-style process file
├── runtime.txt            # Python version specification
├── env.example            # Environment variables template
├── DEPLOYMENT_GUIDE.md    # This file
└── public/                # Static files (Next.js assets)
    ├── images/
    ├── css/
    └── uploads/
```

## 🔧 Local Development

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set Environment Variables**
   ```bash
   # Copy the example file
   cp env.example .env
   
   # Edit .env with your Supabase credentials
   DATABASE_URL=postgresql://postgres:your-password@your-supabase-url.supabase.co:5432/postgres
   SECRET_KEY=your-secret-key-here
   FLASK_DEBUG=true
   ```

3. **Run Migration**
   ```bash
   python migrate.py
   ```

4. **Start Development Server**
   ```bash
   python app_supabase.py
   ```

## 🗄️ Database Schema

The system includes these main tables:

- **`users`** - User accounts and profiles
- **`symptoms`** - Predefined dengue symptoms
- **`assessments`** - Risk assessments with probability calculations
- **`bite_analyses`** - Image analysis results
- **`education_categories`** - Educational content categories
- **`education_content`** - Educational articles
- **`health_services`** - Healthcare facilities

## 🔐 Security Features

- **Row Level Security (RLS)** enabled on all user tables
- **Password hashing** with Werkzeug
- **Session management** with secure tokens
- **Input validation** and SQL injection protection
- **CORS headers** for API endpoints

## 📊 Sample Data

The migration includes:
- 6 demo user accounts (including your existing ones)
- 20+ symptom definitions
- Sample risk assessments
- Educational content about dengue
- Health services in Metro Manila

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check your `DATABASE_URL` format
   - Ensure Supabase project is active
   - Verify database password is correct

2. **Migration Fails**
   - Run `python migrate.py` locally first
   - Check for SQL syntax errors
   - Ensure database has proper permissions

3. **Static Files Not Loading**
   - Verify `public/` directory structure
   - Check file permissions
   - Ensure Flask static folder configuration

### Debug Mode

For development, set:
```bash
FLASK_DEBUG=true
```

This enables:
- Auto-reload on code changes
- Detailed error messages
- Debug toolbar

## 🔄 Migration from JSON to Database

The system automatically migrates existing JSON data:
- User accounts from `data/db.json`
- Assessment history
- Preserves all existing functionality

## 📈 Performance Optimization

- **Database indexes** on frequently queried columns
- **Connection pooling** with SQLAlchemy
- **Image optimization** for bite analysis
- **Caching headers** for static assets

## 🛡️ Production Checklist

Before deploying to production:

- [ ] Change `SECRET_KEY` to a secure random string
- [ ] Set `FLASK_DEBUG=false`
- [ ] Configure proper `DATABASE_URL`
- [ ] Test all functionality locally
- [ ] Run migration successfully
- [ ] Verify file uploads work
- [ ] Check error logging

## 📞 Support

If you encounter issues:

1. Check the logs in Render dashboard
2. Verify environment variables are set correctly
3. Test database connection locally
4. Review the migration output for errors

## 🔄 Updates and Maintenance

To update the system:

1. Make your code changes
2. Test locally with `python app_supabase.py`
3. Push to GitHub
4. Render will automatically deploy

For database schema changes:
1. Update `database.py` models
2. Create new migration script if needed
3. Test migration locally
4. Deploy and monitor logs

---

**Note**: This deployment maintains full compatibility with your existing Next.js frontend while providing a robust, scalable backend infrastructure.
