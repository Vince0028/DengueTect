 

import os
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, DECIMAL, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid

try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
except ImportError:
    pass

DATABASE_URL = os.getenv('DATABASE_URL') or os.getenv('SUPABASE_DB')
if not DATABASE_URL:
    SUPABASE_URL = os.getenv('SUPABASE_URL', 'your-supabase-url')
    SUPABASE_PASSWORD = os.getenv('SUPABASE_PASSWORD', 'your-supabase-password')
    DATABASE_URL = f"postgresql://postgres:{SUPABASE_PASSWORD}@{SUPABASE_URL}/postgres"

_db_url = DATABASE_URL
try:
    if _db_url and 'supabase' in _db_url and 'sslmode=' not in _db_url:
        sep = '&' if '?' in _db_url else '?'
        _db_url = f"{_db_url}{sep}sslmode=require"
except Exception:
    _db_url = DATABASE_URL

engine = create_engine(_db_url, echo=False, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime)
    
    username = Column(String(100))
    phone = Column(String(20))
    location = Column(Text)
    birthdate = Column(DateTime)
    avatar_url = Column(Text)
    
    pretest_prevalence = Column(DECIMAL(5, 4), default=0.055)
    theme = Column(String(10), default='light')
    language = Column(String(10), default='en')
    region = Column(String(50), default='Philippines')
    
    health_reminders = Column(Boolean, default=True)
    risk_alerts = Column(Boolean, default=True)
    
    camera_access = Column(Boolean, default=True)
    location_access = Column(Boolean, default=True)
    data_sharing = Column(Boolean, default=False)
    
    assessments = relationship("Assessment", back_populates="user", cascade="all, delete-orphan")
    bite_analyses = relationship("BiteAnalysis", back_populates="user", cascade="all, delete-orphan")

class Symptom(Base):
    __tablename__ = "symptoms"
    
    id = Column(String(50), primary_key=True)
    label = Column(String(255), nullable=False)
    severity = Column(String(10), nullable=False)
    category = Column(String(50), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class Assessment(Base):
    __tablename__ = "assessments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    
    symptoms = Column(JSONB, nullable=False, default=list)
    model = Column(String(50), default='fernandez2016')
    
    
    probability = Column(DECIMAL(10, 8), nullable=False)
    probability_dev = Column(DECIMAL(10, 8))
    clinical_probability = Column(DECIMAL(10, 8))
    
    
    model_inputs = Column(JSONB)
    model_coefficients = Column(JSONB)
    model_info = Column(JSONB)
    
    
    risk_level = Column(String(20), nullable=False)  
    
    
    pretest_prevalence = Column(DECIMAL(5, 4))
    target_prevalence = Column(DECIMAL(5, 4))
    logit_offset_applied = Column(DECIMAL(10, 8))
    
    
    user = relationship("User", back_populates="assessments")

class BiteAnalysis(Base):
    __tablename__ = "bite_analyses"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    
    image_url = Column(Text)
    image_filename = Column(String(255))
    image_size_bytes = Column(Integer)
    image_width = Column(Integer)
    image_height = Column(Integer)
    
    
    label_text = Column(String(255), nullable=False)
    label_class = Column(String(20), nullable=False)
    
    
    red_pixels = Column(Integer, default=0)
    yellow_pixels = Column(Integer, default=0)
    total_pixels = Column(Integer, default=0)
    red_center_pixels = Column(Integer, default=0)
    yellow_center_pixels = Column(Integer, default=0)
    center_total_pixels = Column(Integer, default=0)
    tile_max_red_density = Column(DECIMAL(8, 6))
    tile_max_yellow_density = Column(DECIMAL(8, 6))
    strong_red_pixels = Column(Integer, default=0)
    strong_red_center_pixels = Column(Integer, default=0)
    
    
    roi_center_x = Column(DECIMAL(10, 8))
    roi_center_y = Column(DECIMAL(10, 8))
    roi_radius = Column(DECIMAL(10, 8))
    
    
    analysis_stats = Column(JSONB)
    
    
    user = relationship("User", back_populates="bite_analyses")

class UserSession(Base):
    __tablename__ = "user_sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    session_token = Column(String(255), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False, index=True)
    ip_address = Column(String(45))
    user_agent = Column(Text)
    is_active = Column(Boolean, default=True)

class EducationCategory(Base):
    __tablename__ = "education_categories"
    
    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    icon = Column(String(50))
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class EducationContent(Base):
    __tablename__ = "education_content"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category_id = Column(String(50), ForeignKey("education_categories.id"), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    url = Column(Text)
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class HealthService(Base):
    __tablename__ = "health_services"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)
    address = Column(Text)
    city = Column(String(100), index=True)
    province = Column(String(100))
    phone = Column(String(20))
    email = Column(String(255))
    website = Column(Text)
    latitude = Column(DECIMAL(10, 8))
    longitude = Column(DECIMAL(11, 8))
    is_emergency = Column(Boolean, default=False, index=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    Base.metadata.create_all(bind=engine)

def drop_tables():
    Base.metadata.drop_all(bind=engine)

def init_db():
    create_tables()
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_db()
