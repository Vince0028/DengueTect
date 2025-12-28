-- DengueTect Supabase Database Schema
-- This SQL file contains the complete database structure for the DengueTect system
-- Based on analysis of the Flask backend and Next.js frontend

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users table - stores user accounts and authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    
    -- Profile information
    username VARCHAR(100),
    phone VARCHAR(20),
    location TEXT,
    birthdate DATE,
    avatar_url TEXT,
    
    -- Settings
    pretest_prevalence DECIMAL(5,4) DEFAULT 0.055, -- Default from Gregory et al. 2010
    theme VARCHAR(10) DEFAULT 'light',
    language VARCHAR(10) DEFAULT 'en',
    region VARCHAR(50) DEFAULT 'Philippines',
    
    -- Notification settings
    health_reminders BOOLEAN DEFAULT TRUE,
    risk_alerts BOOLEAN DEFAULT TRUE,
    
    -- Privacy settings
    camera_access BOOLEAN DEFAULT TRUE,
    location_access BOOLEAN DEFAULT TRUE,
    data_sharing BOOLEAN DEFAULT FALSE
);

-- Symptoms table - predefined symptoms for dengue assessment
CREATE TABLE symptoms (
    id VARCHAR(50) PRIMARY KEY,
    label VARCHAR(255) NOT NULL,
    severity VARCHAR(10) NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
    category VARCHAR(50) NOT NULL, -- 'core', 'warning', 'respiratory', etc.
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Risk assessments table - stores user symptom assessments and calculations
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Assessment data
    symptoms JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of symptom IDs
    model VARCHAR(50) DEFAULT 'fernandez2016',
    
    -- Calculation results
    probability DECIMAL(10,8) NOT NULL, -- Final dengue probability (0-1)
    probability_dev DECIMAL(10,8), -- Development dataset probability
    clinical_probability DECIMAL(10,8), -- Clinical-only probability
    
    -- Model inputs and coefficients
    model_inputs JSONB, -- Input values used in calculation
    model_coefficients JSONB, -- Model coefficients
    model_info JSONB, -- AUC, sensitivity, specificity, etc.
    
    -- Risk level determination
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high')),
    
    -- Metadata
    pretest_prevalence DECIMAL(5,4), -- Prevalence used in calculation
    target_prevalence DECIMAL(5,4),
    logit_offset_applied DECIMAL(10,8)
);

-- Bite analyses table - stores mosquito bite image analyses
CREATE TABLE bite_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Image data
    image_url TEXT,
    image_filename VARCHAR(255),
    image_size_bytes INTEGER,
    image_width INTEGER,
    image_height INTEGER,
    
    -- Analysis results
    label_text VARCHAR(255) NOT NULL, -- "Detected: red/pink area", etc.
    label_class VARCHAR(20) NOT NULL CHECK (label_class IN ('red', 'yellow', 'muted')),
    
    -- Color analysis statistics
    red_pixels INTEGER DEFAULT 0,
    yellow_pixels INTEGER DEFAULT 0,
    total_pixels INTEGER DEFAULT 0,
    red_center_pixels INTEGER DEFAULT 0,
    yellow_center_pixels INTEGER DEFAULT 0,
    center_total_pixels INTEGER DEFAULT 0,
    tile_max_red_density DECIMAL(8,6),
    tile_max_yellow_density DECIMAL(8,6),
    strong_red_pixels INTEGER DEFAULT 0,
    strong_red_center_pixels INTEGER DEFAULT 0,
    
    -- Region of Interest (ROI) data
    roi_center_x DECIMAL(10,8), -- Normalized coordinates (0-1)
    roi_center_y DECIMAL(10,8),
    roi_radius DECIMAL(10,8),
    
    -- Analysis metadata
    analysis_stats JSONB -- Complete analysis statistics
);

-- User sessions table - for session management
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- ============================================================================
-- REFERENCE TABLES
-- ============================================================================

-- Educational content categories
CREATE TABLE education_categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Educational content
CREATE TABLE education_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id VARCHAR(50) REFERENCES education_categories(id),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health services/locations
CREATE TABLE health_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'hospital', 'clinic', 'emergency', etc.
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    website TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_emergency BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Assessments indexes
CREATE INDEX idx_assessments_user_id ON assessments(user_id);
CREATE INDEX idx_assessments_created_at ON assessments(created_at);
CREATE INDEX idx_assessments_risk_level ON assessments(risk_level);
CREATE INDEX idx_assessments_probability ON assessments(probability);

-- Bite analyses indexes
CREATE INDEX idx_bite_analyses_user_id ON bite_analyses(user_id);
CREATE INDEX idx_bite_analyses_created_at ON bite_analyses(created_at);
CREATE INDEX idx_bite_analyses_label_class ON bite_analyses(label_class);

-- Sessions indexes
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Health services indexes
CREATE INDEX idx_health_services_type ON health_services(type);
CREATE INDEX idx_health_services_city ON health_services(city);
CREATE INDEX idx_health_services_is_emergency ON health_services(is_emergency);
CREATE INDEX idx_health_services_location ON health_services(latitude, longitude);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_education_content_updated_at BEFORE UPDATE ON education_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_services_updated_at BEFORE UPDATE ON health_services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Insert predefined symptoms
INSERT INTO symptoms (id, label, severity, category, description) VALUES
-- Core symptoms (CDC common features)
('fever-high', 'High fever (above 38°C)', 'high', 'core', 'Elevated body temperature above 38°C'),
('severe-headache', 'Severe headache', 'medium', 'core', 'Intense headache pain'),
('retro-orbital-pain', 'Pain behind the eyes', 'medium', 'core', 'Retro-orbital pain or eye pain'),
('myalgia', 'Muscle pain', 'medium', 'core', 'Muscle aches and pains'),
('arthralgia', 'Joint pain', 'medium', 'core', 'Joint pain and stiffness'),
('rash', 'Skin rash', 'high', 'core', 'Dermatological rash'),
('nausea-vomit', 'Nausea or vomiting', 'medium', 'core', 'Gastrointestinal symptoms'),

-- Additional common symptoms
('fatigue', 'Extreme tiredness', 'low', 'common', 'Severe fatigue and weakness'),
('loss-appetite', 'Loss of appetite', 'low', 'common', 'Decreased desire to eat'),
('no-cough', 'No cough', 'low', 'respiratory', 'Absence of cough (negative predictor)'),
('no-sore-throat', 'No sore throat', 'low', 'respiratory', 'Absence of sore throat (negative predictor)'),

-- Warning signs (WHO/CDC severe dengue indicators)
('severe-abdominal-pain', 'Severe abdominal pain', 'high', 'warning', 'Intense abdominal pain'),
('persistent-vomiting', 'Persistent vomiting', 'high', 'warning', 'Continuous vomiting'),
('gingival-bleeding', 'Gingival bleeding', 'high', 'warning', 'Bleeding from gums'),
('epistaxis', 'Epistaxis (nosebleed)', 'high', 'warning', 'Nosebleed'),
('petechiae', 'Petechiae', 'high', 'warning', 'Small red spots on skin'),
('blood-in-vomit-stool', 'Blood in vomit or stool', 'high', 'warning', 'Gastrointestinal bleeding'),
('lethargy-restlessness', 'Lethargy or restlessness', 'high', 'warning', 'Altered mental state'),
('rapid-breathing', 'Rapid breathing', 'high', 'warning', 'Increased respiratory rate'),
('skin-paleness', 'Skin paleness', 'high', 'warning', 'Pale or cold skin');

-- Insert education categories
INSERT INTO education_categories (id, name, description, icon, sort_order) VALUES
('dengue', 'What is Dengue?', 'Learn about dengue fever, symptoms, and prevention', 'BookOpen', 1),
('services', 'Local Health Services', 'Find nearby healthcare facilities and emergency contacts', 'MapPin', 2);

-- Insert sample educational content
INSERT INTO education_content (category_id, title, content, sort_order) VALUES
('dengue', 'Understanding Dengue Fever', 
'Dengue fever is a mosquito-borne viral infection that causes flu-like illness and can develop into a potentially lethal complication called severe dengue. The virus is transmitted by Aedes mosquitoes, particularly Aedes aegypti and Aedes albopictus.', 1),

('dengue', 'Common Symptoms',
'Most people with dengue have mild or no symptoms and will get better in 1–2 weeks. Common symptoms include high fever (40°C/104°F), severe headache, pain behind the eyes, muscle and joint pains, nausea, vomiting, swollen glands, or rash.', 2),

('dengue', 'Warning Signs',
'Watch for warning signs as they typically begin in the 24–48 hours after your fever goes away. These include severe stomach pain, persistent vomiting, bleeding from your gums or nose, blood in your urine, stools, or vomit, bleeding under the skin, difficult or rapid breathing, or extreme fatigue.', 3),

('services', 'Emergency Contacts',
'For immediate medical attention: Emergency Hotline: 911, DOH Health Emergency: 1555, Philippine Red Cross: 143', 1),

('services', 'Major Hospitals',
'List of major hospitals with dengue treatment capabilities: Philippine General Hospital, St. Luke''s Medical Center, Makati Medical Center, and other tertiary hospitals.', 2);

-- Insert sample health services
INSERT INTO health_services (name, type, address, city, province, phone, is_emergency, latitude, longitude) VALUES
('Philippine General Hospital', 'hospital', 'Taft Avenue, Ermita', 'Manila', 'Metro Manila', '(02) 8554-8400', TRUE, 14.5815, 120.9855),
('St. Luke''s Medical Center - Quezon City', 'hospital', '279 E Rodriguez Sr. Ave', 'Quezon City', 'Metro Manila', '(02) 8723-0101', TRUE, 14.6109, 121.0436),
('Makati Medical Center', 'hospital', '2 Amorsolo St, Legazpi Village', 'Makati', 'Metro Manila', '(02) 8888-8999', TRUE, 14.5547, 121.0244),
('East Avenue Medical Center', 'hospital', 'East Avenue, Diliman', 'Quezon City', 'Metro Manila', '(02) 8926-0071', TRUE, 14.6146, 121.0648),
('Pasay City General Hospital', 'hospital', 'F.B. Harrison St, Pasay City', 'Pasay', 'Metro Manila', '(02) 831-1400', TRUE, 14.5378, 120.9978);

-- Insert sample users (demo accounts)
INSERT INTO users (id, email, password_hash, username, phone, location, birthdate, pretest_prevalence) VALUES
('d4eb8766-13b1-4988-942c-7db26b15600e', 'alobinvince@gmail.com', 'scrypt:32768:8:1$h56Bzv5Vhw6UUyDj$81f09e19142101978299a057fb73b9eb91bd4917eb4c44d555d032c9bbaaf45789247c8a89397ce4ff5e1635f0d15da2d0060fb2def0a8f12677b810ebfa5641', 'Vince Alobin', '+63 912 345 6789', 'Barangay 183 Villamor, Pasay City', '1990-05-15', 0.055),

('cc8a07c7-9d51-4f1e-8c4b-de0864103f7a', 'kikorickcruz@gmail.com', 'scrypt:32768:8:1$ssTN7XWk9jhyHko6$7e94d5e04d7bc491fba893954e05970b189e28a789b2f4e34f9dc922d22348f5045094b11ddb6344ebb6a10d858fc21c8ed880b35b04fe85ec8c92128792cacb', 'Kiko Rick Cruz', '+63 917 123 4567', 'Quezon City, Metro Manila', '1985-03-22', 0.055),

('511c49ca-d3c3-415a-b205-3574afe70ce9', 'raibe@student.apc.edu.ph', 'scrypt:32768:8:1$RT0wYjUuvI3YcfAp$14ce2316aa023b01828342ed7ae740ac825eec04298635462b8836c22f697aa5ff01c4efdd0711d3954c754a274c9a43fad2dbe3c6e130ea1333a4b5fc453b3e', 'Raibe Student', '+63 918 987 6543', 'Makati City, Metro Manila', '1995-08-10', 0.055),

-- Additional demo users
('11111111-1111-1111-1111-111111111111', 'demo1@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J.7.8.9.0', 'Juan Dela Cruz', '+63 912 345 6789', 'Barangay 183 Villamor, Pasay City', '1990-01-15', 0.055),
('22222222-2222-2222-2222-222222222222', 'demo2@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J.7.8.9.0', 'Maria Santos', '+63 917 234 5678', 'Taguig City, Metro Manila', '1988-07-20', 0.055),
('33333333-3333-3333-3333-333333333333', 'demo3@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J.7.8.9.0', 'Pedro Rodriguez', '+63 918 345 6789', 'Mandaluyong City, Metro Manila', '1992-12-03', 0.055);

-- Insert sample assessments (based on the JSON data)
INSERT INTO assessments (id, user_id, created_at, symptoms, model, probability, probability_dev, risk_level, model_inputs, model_coefficients, model_info, pretest_prevalence) VALUES
('51978b9c-44c4-4045-864e-747b2cb75985', 'd4eb8766-13b1-4988-942c-7db26b15600e', '2025-09-10T10:57:46.147606Z', '["nausea-vomit", "fatigue"]', 'fernandez2016', 0.045423604283086824, 0.6668561551530612, 'low', '{"petechiae": 0, "retro_ocular_pain": 0, "gingival_bleeding": 0, "epistaxis": 0, "skin_paleness": 0}', '{"intercept": 0.694, "petechiae": 0.718, "retro_ocular_pain": 0.516, "gingival_bleeding": 0.316, "epistaxis": -0.474, "skin_paleness": -0.535}', '{"auc": 0.663, "auc_ci": [0.616, 0.71], "reported_sensitivity": 0.862, "reported_specificity": 0.27, "explored_threshold": 0.6}', 0.055),

('3e2916b0-e688-4887-8c0c-047fed5c6923', 'd4eb8766-13b1-4988-942c-7db26b15600e', '2025-09-10T10:58:13.154810Z', '["fever-high", "severe-headache", "nausea-vomit", "fatigue"]', 'fernandez2016', 0.045423604283086824, 0.6668561551530612, 'low', '{"petechiae": 0, "retro_ocular_pain": 0, "gingival_bleeding": 0, "epistaxis": 0, "skin_paleness": 0}', '{"intercept": 0.694, "petechiae": 0.718, "retro_ocular_pain": 0.516, "gingival_bleeding": 0.316, "epistaxis": -0.474, "skin_paleness": -0.535}', '{"auc": 0.663, "auc_ci": [0.616, 0.71], "reported_sensitivity": 0.862, "reported_specificity": 0.27, "explored_threshold": 0.6}', 0.055),

('571a78fe-5b16-4507-ad31-ae78b02add52', 'd4eb8766-13b1-4988-942c-7db26b15600e', '2025-09-10T11:14:19.358377Z', '["fever-high", "severe-headache", "retro-orbital-pain", "myalgia", "arthralgia", "nausea-vomit", "rash", "fatigue", "loss-appetite", "severe-abdominal-pain", "persistent-vomiting", "gingival-bleeding", "epistaxis", "petechiae", "blood-in-vomit-stool", "lethargy-restlessness", "rapid-breathing", "skin-paleness"]', 'fernandez2016', 0.07556176841665836, 0.6668561551530612, 'high', '{"petechiae": 1, "retro_ocular_pain": 1, "gingival_bleeding": 1, "epistaxis": 1, "skin_paleness": 1}', '{"intercept": 0.694, "petechiae": 0.718, "retro_ocular_pain": 0.516, "gingival_bleeding": 0.316, "epistaxis": -0.474, "skin_paleness": -0.535}', '{"auc": 0.663, "auc_ci": [0.616, 0.71], "reported_sensitivity": 0.862, "reported_specificity": 0.27, "explored_threshold": 0.6}', 0.055),

('34f3599f-8176-498c-8485-7defe2cfe488', '511c49ca-d3c3-415a-b205-3574afe70ce9', '2025-09-11T02:34:31.978996Z', '["severe-headache", "myalgia", "rash"]', 'fernandez2016', 0.045423604283086824, 0.6668561551530612, 'moderate', '{"petechiae": 0, "retro_ocular_pain": 0, "gingival_bleeding": 0, "epistaxis": 0, "skin_paleness": 0}', '{"intercept": 0.694, "petechiae": 0.718, "retro_ocular_pain": 0.516, "gingival_bleeding": 0.316, "epistaxis": -0.474, "skin_paleness": -0.535}', '{"auc": 0.663, "auc_ci": [0.616, 0.71], "reported_sensitivity": 0.862, "reported_specificity": 0.27, "explored_threshold": 0.6}', 0.055);

-- Insert sample bite analyses
INSERT INTO bite_analyses (id, user_id, created_at, image_url, label_text, label_class, red_pixels, yellow_pixels, total_pixels, red_center_pixels, yellow_center_pixels, center_total_pixels, tile_max_red_density, tile_max_yellow_density, roi_center_x, roi_center_y, roi_radius, analysis_stats) VALUES
('a7bf35daf3ca45e8b7b8a1c8461d3cf8', 'd4eb8766-13b1-4988-942c-7db26b15600e', '2025-09-11T10:34:43.577365Z', '/uploads/bites/23d861ab8cce4a6990f22300fa5de15b.jpg', 'Detected: yellowish area', 'yellow', 176, 2013, 34207, 174, 0, 10058, 0.5378787878787878, 0.8515625, 0.31944443384806315, 0.5674153327941894, 0.25, '{"red": 176, "yellow": 2013, "total": 34207, "redC": 174, "yellowC": 0, "centerTotal": 10058, "tileMaxRedDensity": 0.5378787878787878, "tileMaxYellowDensity": 0.8515625, "strongRed": 0, "strongRedC": 0}'),

('e3943c83fde94c36b91ca0f7381a077d', 'cc8a07c7-9d51-4f1e-8c4b-de0864103f7a', '2025-09-11T10:34:43.584082Z', '/uploads/bites/e47d3ce6a1ac4bf0a590ed12a3b864f3.jpg', 'Detected: yellowish area', 'yellow', 176, 2013, 34207, 174, 0, 10058, 0.5378787878787878, 0.8515625, 0.31944443384806315, 0.5674153327941894, 0.25, '{"red": 176, "yellow": 2013, "total": 34207, "redC": 174, "yellowC": 0, "centerTotal": 10058, "tileMaxRedDensity": 0.5378787878787878, "tileMaxYellowDensity": 0.8515625, "strongRed": 0, "strongRedC": 0}');

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bite_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Assessments policies
CREATE POLICY "Users can view own assessments" ON assessments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessments" ON assessments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Bite analyses policies
CREATE POLICY "Users can view own bite analyses" ON bite_analyses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bite analyses" ON bite_analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Sessions policies
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON user_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public read access for reference tables
CREATE POLICY "Anyone can view symptoms" ON symptoms FOR SELECT USING (true);
CREATE POLICY "Anyone can view education categories" ON education_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view education content" ON education_content FOR SELECT USING (true);
CREATE POLICY "Anyone can view health services" ON health_services FOR SELECT USING (true);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to calculate dengue probability using Fernández et al. 2016 model
CREATE OR REPLACE FUNCTION calculate_dengue_probability(
    symptoms_input JSONB,
    target_prevalence DECIMAL DEFAULT 0.055
) RETURNS JSONB AS $$
DECLARE
    symptoms_set JSONB;
    inputs JSONB;
    coeffs JSONB;
    y_dev DECIMAL;
    y DECIMAL;
    p_dev DECIMAL;
    p DECIMAL;
    dev_prev DECIMAL := 0.71;
    logit_offset DECIMAL;
    result JSONB;
BEGIN
    -- Extract symptoms from input
    symptoms_set := COALESCE(symptoms_input, '[]'::jsonb);
    
    -- Map symptoms to model inputs (booleans 0/1)
    inputs := jsonb_build_object(
        'petechiae', CASE WHEN symptoms_set ? 'petechiae' THEN 1 ELSE 0 END,
        'retro_ocular_pain', CASE WHEN symptoms_set ? 'retro-orbital-pain' THEN 1 ELSE 0 END,
        'gingival_bleeding', CASE WHEN (symptoms_set ? 'gingival-bleeding' OR symptoms_set ? 'bleeding-gums-nose') THEN 1 ELSE 0 END,
        'epistaxis', CASE WHEN (symptoms_set ? 'epistaxis' OR symptoms_set ? 'bleeding-gums-nose') THEN 1 ELSE 0 END,
        'skin_paleness', CASE WHEN symptoms_set ? 'skin-paleness' THEN 1 ELSE 0 END
    );
    
    -- Model coefficients from Fernández et al. (2016)
    coeffs := jsonb_build_object(
        'intercept', 0.694,
        'petechiae', 0.718,
        'retro_ocular_pain', 0.516,
        'gingival_bleeding', 0.316,
        'epistaxis', -0.474,
        'skin_paleness', -0.535
    );
    
    -- Calculate linear predictor using development model coefficients
    y_dev := (coeffs->>'intercept')::DECIMAL +
             (coeffs->>'petechiae')::DECIMAL * (inputs->>'petechiae')::INTEGER +
             (coeffs->>'retro_ocular_pain')::DECIMAL * (inputs->>'retro_ocular_pain')::INTEGER +
             (coeffs->>'gingival_bleeding')::DECIMAL * (inputs->>'gingival_bleeding')::INTEGER +
             (coeffs->>'epistaxis')::DECIMAL * (inputs->>'epistaxis')::INTEGER +
             (coeffs->>'skin_paleness')::DECIMAL * (inputs->>'skin_paleness')::INTEGER;
    
    p_dev := 1.0 / (1.0 + EXP(-y_dev));
    
    -- Recalibrate intercept to target pretest prevalence
    logit_offset := LN(target_prevalence / (1.0 - target_prevalence)) - LN(dev_prev / (1.0 - dev_prev));
    y := y_dev + logit_offset;
    p := 1.0 / (1.0 + EXP(-y));
    
    -- Build result
    result := jsonb_build_object(
        'y_dev', y_dev,
        'y', y,
        'p', p,
        'p_dev', p_dev,
        'inputs', inputs,
        'coeffs', coeffs,
        'offset_applied', logit_offset,
        'target_prevalence', target_prevalence,
        'development_prevalence', dev_prev
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to determine risk level based on probability and symptoms
CREATE OR REPLACE FUNCTION determine_risk_level(
    probability DECIMAL,
    symptoms_input JSONB
) RETURNS VARCHAR AS $$
DECLARE
    symptoms_set JSONB;
    warning_signs JSONB;
    core_symptoms JSONB;
    wcount INTEGER;
    ccount INTEGER;
    base_risk VARCHAR;
BEGIN
    symptoms_set := COALESCE(symptoms_input, '[]'::jsonb);
    
    -- Define warning signs
    warning_signs := '["severe-abdominal-pain", "persistent-vomiting", "gingival-bleeding", "epistaxis", "blood-in-vomit-stool", "lethargy-restlessness", "rapid-breathing", "skin-paleness"]'::jsonb;
    
    -- Define core symptoms
    core_symptoms := '["fever-high", "severe-headache", "retro-orbital-pain", "myalgia", "arthralgia", "rash", "nausea-vomit"]'::jsonb;
    
    -- Count warning signs present
    wcount := 0;
    FOR i IN 0..jsonb_array_length(warning_signs)-1 LOOP
        IF symptoms_set ? (warning_signs->>i) THEN
            wcount := wcount + 1;
        END IF;
    END LOOP;
    
    -- Count core symptoms present
    ccount := 0;
    FOR i IN 0..jsonb_array_length(core_symptoms)-1 LOOP
        IF symptoms_set ? (core_symptoms->>i) THEN
            ccount := ccount + 1;
        END IF;
    END LOOP;
    
    -- Determine base risk from probability
    IF probability >= 0.60 THEN
        base_risk := 'high';
    ELSIF probability >= 0.30 THEN
        base_risk := 'moderate';
    ELSE
        base_risk := 'low';
    END IF;
    
    -- Escalate based on warning signs
    IF wcount >= 2 THEN
        RETURN 'high';
    ELSIF wcount = 1 AND base_risk = 'low' THEN
        RETURN 'moderate';
    END IF;
    
    -- Escalate based on core symptom burden
    IF ccount >= 5 AND base_risk != 'high' THEN
        RETURN 'high';
    ELSIF ccount >= 3 AND base_risk = 'low' THEN
        RETURN 'moderate';
    END IF;
    
    RETURN base_risk;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS
-- ============================================================================

-- User assessment summary view
CREATE VIEW user_assessment_summary AS
SELECT 
    u.id as user_id,
    u.email,
    u.username,
    COUNT(a.id) as total_assessments,
    MAX(a.created_at) as last_assessment,
    MAX(a.probability) as highest_probability,
    a.risk_level as current_risk_level
FROM users u
LEFT JOIN assessments a ON u.id = a.user_id
GROUP BY u.id, u.email, u.username, a.risk_level;

-- Recent assessments view
CREATE VIEW recent_assessments AS
SELECT 
    a.id,
    a.user_id,
    u.username,
    u.email,
    a.created_at,
    a.symptoms,
    a.probability,
    a.risk_level,
    a.pretest_prevalence
FROM assessments a
JOIN users u ON a.user_id = u.id
ORDER BY a.created_at DESC;

-- Bite analysis summary view
CREATE VIEW bite_analysis_summary AS
SELECT 
    ba.id,
    ba.user_id,
    u.username,
    ba.created_at,
    ba.label_text,
    ba.label_class,
    ba.image_url,
    ba.roi_center_x,
    ba.roi_center_y
FROM bite_analyses ba
JOIN users u ON ba.user_id = u.id
ORDER BY ba.created_at DESC;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE users IS 'User accounts and profile information for DengueTect system';
COMMENT ON TABLE symptoms IS 'Predefined symptoms used in dengue risk assessment';
COMMENT ON TABLE assessments IS 'User symptom assessments with dengue probability calculations';
COMMENT ON TABLE bite_analyses IS 'Mosquito bite image analyses using computer vision';
COMMENT ON TABLE user_sessions IS 'User session management for authentication';
COMMENT ON TABLE education_categories IS 'Categories for educational content';
COMMENT ON TABLE education_content IS 'Educational articles and resources about dengue';
COMMENT ON TABLE health_services IS 'Healthcare facilities and emergency contacts';

COMMENT ON FUNCTION calculate_dengue_probability IS 'Calculates dengue probability using Fernández et al. 2016 logistic model';
COMMENT ON FUNCTION determine_risk_level IS 'Determines risk level based on probability and symptom patterns';

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

-- The database schema is now complete with:
-- - All necessary tables for the DengueTect system
-- - Sample data for demonstration
-- - Row Level Security policies
-- - Helper functions for dengue probability calculation
-- - Indexes for optimal performance
-- - Views for common queries
-- - Proper relationships and constraints

SELECT 'DengueTect Supabase database schema created successfully!' as message;
