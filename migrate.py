"""
DengueTect Database Migration Script
Handles database setup, migrations, and sample data seeding
"""

import os
import json
from datetime import datetime
from sqlalchemy import text
from sqlalchemy.orm import Session
from database import engine, SessionLocal, Base, User, Symptom, Assessment, BiteAnalysis, EducationCategory, EducationContent, HealthService
import uuid
from werkzeug.security import generate_password_hash

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # dotenv not available, use system environment variables

def run_sql_file(sql_file_path):
    """Execute SQL file"""
    try:
        with open(sql_file_path, 'r', encoding='utf-8') as file:
            sql_content = file.read()
        
        with engine.connect() as connection:
            # Split SQL content by semicolons and execute each statement
            statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]
            for statement in statements:
                if statement and not statement.startswith('--'):
                    try:
                        connection.execute(text(statement))
                        connection.commit()
                    except Exception as e:
                        print(f"Warning: Could not execute statement: {e}")
                        continue
        
        print(f"Successfully executed SQL file: {sql_file_path}")
        return True
    except Exception as e:
        print(f"Error executing SQL file: {e}")
        return False

def seed_sample_data():
    """Seed database with sample data"""
    db = SessionLocal()
    try:
        # Check if data already exists
        if db.query(User).first():
            print("Sample data already exists, skipping seed...")
            return
        
        print("Seeding sample data...")
        
        # Sample symptoms
        symptoms_data = [
            {'id': 'fever-high', 'label': 'High fever (above 38°C)', 'severity': 'high', 'category': 'core'},
            {'id': 'severe-headache', 'label': 'Severe headache', 'severity': 'medium', 'category': 'core'},
            {'id': 'retro-orbital-pain', 'label': 'Pain behind the eyes', 'severity': 'medium', 'category': 'core'},
            {'id': 'myalgia', 'label': 'Muscle pain', 'severity': 'medium', 'category': 'core'},
            {'id': 'arthralgia', 'label': 'Joint pain', 'severity': 'medium', 'category': 'core'},
            {'id': 'rash', 'label': 'Skin rash', 'severity': 'high', 'category': 'core'},
            {'id': 'nausea-vomit', 'label': 'Nausea or vomiting', 'severity': 'medium', 'category': 'core'},
            {'id': 'fatigue', 'label': 'Extreme tiredness', 'severity': 'low', 'category': 'common'},
            {'id': 'loss-appetite', 'label': 'Loss of appetite', 'severity': 'low', 'category': 'common'},
            {'id': 'severe-abdominal-pain', 'label': 'Severe abdominal pain', 'severity': 'high', 'category': 'warning'},
            {'id': 'persistent-vomiting', 'label': 'Persistent vomiting', 'severity': 'high', 'category': 'warning'},
            {'id': 'gingival-bleeding', 'label': 'Gingival bleeding', 'severity': 'high', 'category': 'warning'},
            {'id': 'epistaxis', 'label': 'Epistaxis (nosebleed)', 'severity': 'high', 'category': 'warning'},
            {'id': 'petechiae', 'label': 'Petechiae', 'severity': 'high', 'category': 'warning'},
            {'id': 'skin-paleness', 'label': 'Skin paleness', 'severity': 'high', 'category': 'warning'},
        ]
        
        for symptom_data in symptoms_data:
            symptom = Symptom(**symptom_data)
            db.add(symptom)
        
        # Sample users
        users_data = [
            {
                'id': uuid.UUID('d4eb8766-13b1-4988-942c-7db26b15600e'),
                'email': 'alobinvince@gmail.com',
                'password_hash': 'scrypt:32768:8:1$h56Bzv5Vhw6UUyDj$81f09e19142101978299a057fb73b9eb91bd4917eb4c44d555d032c9bbaaf45789247c8a89397ce4ff5e1635f0d15da2d0060fb2def0a8f12677b810ebfa5641',
                'username': 'Vince Alobin',
                'phone': '+63 912 345 6789',
                'location': 'Barangay 183 Villamor, Pasay City',
                'birthdate': datetime(1990, 5, 15),
                'pretest_prevalence': 0.055
            },
            {
                'id': uuid.UUID('cc8a07c7-9d51-4f1e-8c4b-de0864103f7a'),
                'email': 'kikorickcruz@gmail.com',
                'password_hash': 'scrypt:32768:8:1$ssTN7XWk9jhyHko6$7e94d5e04d7bc491fba893954e05970b189e28a789b2f4e34f9dc922d22348f5045094b11ddb6344ebb6a10d858fc21c8ed880b35b04fe85ec8c92128792cacb',
                'username': 'Kiko Rick Cruz',
                'phone': '+63 917 123 4567',
                'location': 'Quezon City, Metro Manila',
                'birthdate': datetime(1985, 3, 22),
                'pretest_prevalence': 0.055
            },
            {
                'id': uuid.UUID('511c49ca-d3c3-415a-b205-3574afe70ce9'),
                'email': 'raibe@student.apc.edu.ph',
                'password_hash': 'scrypt:32768:8:1$RT0wYjUuvI3YcfAp$14ce2316aa023b01828342ed7ae740ac825eec04298635462b8836c22f697aa5ff01c4efdd0711d3954c754a274c9a43fad2dbe3c6e130ea1333a4b5fc453b3e',
                'username': 'Raibe Student',
                'phone': '+63 918 987 6543',
                'location': 'Makati City, Metro Manila',
                'birthdate': datetime(1995, 8, 10),
                'pretest_prevalence': 0.055
            }
        ]
        
        for user_data in users_data:
            user = User(**user_data)
            db.add(user)
        
        # Sample education categories
        education_categories_data = [
            {'id': 'dengue', 'name': 'What is Dengue?', 'description': 'Learn about dengue fever, symptoms, and prevention', 'icon': 'BookOpen', 'sort_order': 1},
            {'id': 'services', 'name': 'Local Health Services', 'description': 'Find nearby healthcare facilities and emergency contacts', 'icon': 'MapPin', 'sort_order': 2}
        ]
        
        for category_data in education_categories_data:
            category = EducationCategory(**category_data)
            db.add(category)
        
        # Sample health services
        health_services_data = [
            {
                'name': 'Philippine General Hospital',
                'type': 'hospital',
                'address': 'Taft Avenue, Ermita',
                'city': 'Manila',
                'province': 'Metro Manila',
                'phone': '(02) 8554-8400',
                'is_emergency': True,
                'latitude': 14.5815,
                'longitude': 120.9855
            },
            {
                'name': 'St. Luke\'s Medical Center - Quezon City',
                'type': 'hospital',
                'address': '279 E Rodriguez Sr. Ave',
                'city': 'Quezon City',
                'province': 'Metro Manila',
                'phone': '(02) 8723-0101',
                'is_emergency': True,
                'latitude': 14.6109,
                'longitude': 121.0436
            },
            {
                'name': 'Makati Medical Center',
                'type': 'hospital',
                'address': '2 Amorsolo St, Legazpi Village',
                'city': 'Makati',
                'province': 'Metro Manila',
                'phone': '(02) 8888-8999',
                'is_emergency': True,
                'latitude': 14.5547,
                'longitude': 121.0244
            }
        ]
        
        for service_data in health_services_data:
            service = HealthService(**service_data)
            db.add(service)
        
        db.commit()
        print("Sample data seeded successfully!")
        
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

def migrate_from_json():
    """Migrate data from existing JSON files"""
    db = SessionLocal()
    try:
        print("Migrating data from JSON files...")
        
        # Load existing JSON data
        json_file = 'data/db.json'
        if os.path.exists(json_file):
            with open(json_file, 'r') as f:
                json_data = json.load(f)
            
            # Migrate users
            for user_data in json_data.get('users', []):
                existing_user = db.query(User).filter(User.id == user_data['id']).first()
                if not existing_user:
                    user = User(
                        id=user_data['id'],
                        email=user_data['email'],
                        password_hash=user_data['password_hash'],
                        created_at=datetime.fromisoformat(user_data['created_at'].replace('Z', '+00:00')),
                        pretest_prevalence=user_data.get('settings', {}).get('pretest_prevalence', 0.055)
                    )
                    db.add(user)
            
            # Migrate assessments
            for assessment_data in json_data.get('assessments', []):
                if assessment_data.get('user_id'):  # Only migrate assessments with user_id
                    existing_assessment = db.query(Assessment).filter(Assessment.id == assessment_data['id']).first()
                    if not existing_assessment:
                        assessment = Assessment(
                            id=assessment_data['id'],
                            user_id=assessment_data['user_id'],
                            created_at=datetime.fromisoformat(assessment_data['created_at'].replace('Z', '+00:00')),
                            symptoms=assessment_data['symptoms'],
                            model=assessment_data['model'],
                            probability=float(assessment_data['calc']['p']),
                            probability_dev=float(assessment_data['calc'].get('p_dev', 0)),
                            risk_level=assessment_data['risk_level_display'],
                            model_inputs=assessment_data['calc'].get('inputs', {}),
                            model_coefficients=assessment_data['calc'].get('coeffs', {}),
                            model_info=assessment_data['calc'].get('model_info', {}),
                            pretest_prevalence=assessment_data['calc'].get('model_info', {}).get('prevalence', {}).get('target_prevalence', 0.055)
                        )
                        db.add(assessment)
            
            db.commit()
            print("JSON data migrated successfully!")
        else:
            print("No JSON data file found to migrate")
            
    except Exception as e:
        print(f"Error migrating JSON data: {e}")
        db.rollback()
    finally:
        db.close()

def main():
    """Main migration function"""
    print("Starting DengueTect database migration...")
    
    # Create tables
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    # Run SQL schema file if it exists
    sql_file = 'denguetect_supabase_schema.sql'
    if os.path.exists(sql_file):
        print(f"Running SQL schema file: {sql_file}")
        run_sql_file(sql_file)
    else:
        print("SQL schema file not found, using SQLAlchemy models only")
    
    # Seed sample data
    seed_sample_data()
    
    # Migrate from JSON if exists
    migrate_from_json()
    
    print("Database migration completed successfully!")

if __name__ == "__main__":
    main()
