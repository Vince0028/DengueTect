"""
Test script to verify the app can start properly for deployment
"""

import os
import sys

# Load environment variables
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

def test_imports():
    """Test if all required modules can be imported"""
    try:
        import flask
        import sqlalchemy
        import psycopg2
        from PIL import Image
        import gunicorn
        print("SUCCESS: All imports successful")
        return True
    except ImportError as e:
        print(f"ERROR: Import error: {e}")
        return False

def test_database_connection():
    """Test database connection"""
    try:
        from database import SessionLocal
        db = SessionLocal()
        db.close()
        print("SUCCESS: Database connection successful")
        return True
    except Exception as e:
        print(f"ERROR: Database connection failed: {e}")
        return False

def test_app_creation():
    """Test if the Flask app can be created"""
    try:
        from app_supabase import app
        print("SUCCESS: Flask app creation successful")
        return True
    except Exception as e:
        print(f"ERROR: Flask app creation failed: {e}")
        return False

def main():
    """Run all tests"""
    print("Testing deployment readiness...")
    print("=" * 40)
    
    tests = [
        ("Import Test", test_imports),
        ("Database Connection", test_database_connection),
        ("Flask App Creation", test_app_creation),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        result = test_func()
        results.append(result)
    
    print("\n" + "=" * 40)
    if all(results):
        print("SUCCESS: All tests passed! Ready for deployment.")
        return True
    else:
        print("ERROR: Some tests failed. Check the errors above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
