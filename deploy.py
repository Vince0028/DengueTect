"""
DengueTect Deployment Helper Script
Run this before deploying to ensure everything is ready
"""

import os
import sys

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # dotenv not available, use system environment variables

def check_environment():
    """Check if required environment variables are set"""
    required_vars = ['DATABASE_URL', 'SUPABASE_DB']
    found_vars = []
    
    for var in required_vars:
        if os.getenv(var):
            found_vars.append(var)
    
    if not found_vars:
        print("ERROR: No database connection found!")
        print("Please set one of these environment variables:")
        print("  - DATABASE_URL (recommended)")
        print("  - SUPABASE_DB")
        return False
    
    print(f"SUCCESS: Database connection found: {found_vars[0]}")
    return True

def check_dependencies():
    """Check if required dependencies are installed"""
    try:
        import flask
        import sqlalchemy
        import psycopg2
        from PIL import Image  # This is the correct import for Pillow
        import gunicorn
        print("SUCCESS: All required dependencies are installed")
        return True
    except ImportError as e:
        print(f"ERROR: Missing dependency: {e}")
        print("Run: pip install -r requirements.txt")
        return False

def main():
    """Main deployment check"""
    print("DengueTect Deployment Check")
    print("=" * 40)
    
    # Check environment
    env_ok = check_environment()
    
    # Check dependencies
    deps_ok = check_dependencies()
    
    if env_ok and deps_ok:
        print("\nSUCCESS: Ready for deployment!")
        print("\nNext steps:")
        print("1. Push your code to GitHub")
        print("2. Connect your repository to Render")
        print("3. Set environment variables in Render dashboard:")
        print("   - DATABASE_URL: your-supabase-connection-string")
        print("   - SECRET_KEY: generate-a-secure-key")
        print("   - FLASK_DEBUG: false")
        return True
    else:
        print("\nERROR: Not ready for deployment. Please fix the issues above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
