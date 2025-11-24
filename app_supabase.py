

from flask import Flask, render_template, request, redirect, url_for, session, jsonify, send_from_directory
from datetime import datetime
import os
import json
import uuid
import math
import socket
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import base64
import io
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import SessionLocal, User, Assessment, BiteAnalysis, Symptom

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

try:
    from PIL import Image
except Exception:
    Image = None

app = Flask(__name__, static_folder='public', static_url_path='/')
app.secret_key = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
USE_DB_FUNCTIONS = (os.getenv('USE_DB_FUNCTIONS', 'false').lower() == 'true')
@app.after_request
def add_no_cache_headers(response):
    try:
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
    except Exception:
        pass
    return response

BASE_DIR = os.path.dirname(__file__)
ANALYSIS_DIR = os.path.join(BASE_DIR, 'data', 'analyses')
dist_dir = os.path.join(BASE_DIR, 'landing_page', 'dist')

def get_db():
    """Get database session"""
    return SessionLocal()

def _get_user_by_email(db: Session, email: str):
    """Get user by email"""
    return db.query(User).filter(User.email == email).first()

def _create_user(db: Session, email: str, password: str):
    """Create new user"""
    user = User(
        email=email,
        password_hash=generate_password_hash(password),
        created_at=datetime.utcnow()
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def _get_user_pretest_prevalence(db: Session, user_id: str):
    """Return user-specific pretest prevalence if set, otherwise None."""
    user = db.query(User).filter(User.id == user_id).first()
    if user and user.pretest_prevalence:
        return float(user.pretest_prevalence)
    return None

def _get_last_assessment(db: Session, user_id: str, require_symptoms: bool = True):
    """Return the most recent assessment for a user."""
    query = db.query(Assessment).filter(Assessment.user_id == user_id)
    if require_symptoms:
        query = query.filter(Assessment.symptoms != [])
    return query.order_by(Assessment.created_at.desc()).first()

def _logit(p):
    """Calculate logit function"""
    return math.log(p / (1.0 - p))

ENHANCED_SYMPTOMS_DATA = {
    'fever-high': {'weight': 15, 'category': 'core', 'name': 'High fever (≥38.5°C)'},
    'severe-headache': {'weight': 12, 'category': 'core', 'name': 'Severe headache'},
    'retro-orbital-pain': {'weight': 14, 'category': 'core', 'name': 'Pain behind the eyes'},
    'myalgia': {'weight': 10, 'category': 'core', 'name': 'Muscle pain'},
    'arthralgia': {'weight': 10, 'category': 'core', 'name': 'Joint pain'},
    'nausea-vomit': {'weight': 8, 'category': 'core', 'name': 'Nausea or vomiting'},
    'rash': {'weight': 12, 'category': 'core', 'name': 'Skin rash'},
    'fatigue': {'weight': 6, 'category': 'core', 'name': 'Fatigue / weakness'},
    'loss-appetite': {'weight': 4, 'category': 'core', 'name': 'Loss of appetite'},
    'no-cough': {'weight': 8, 'category': 'additional', 'name': 'No cough'},
    'no-sore-throat': {'weight': 8, 'category': 'additional', 'name': 'No sore throat'},
    'severe-abdominal-pain': {'weight': 20, 'category': 'warning', 'name': 'Severe abdominal pain'},
    'persistent-vomiting': {'weight': 18, 'category': 'warning', 'name': 'Persistent vomiting'},
    'gingival-bleeding': {'weight': 22, 'category': 'warning', 'name': 'Gingival bleeding'},
    'epistaxis': {'weight': 20, 'category': 'warning', 'name': 'Nosebleed (epistaxis)'},
    'petechiae': {'weight': 25, 'category': 'warning', 'name': 'Petechiae (small red spots)'},
    'blood-in-vomit-stool': {'weight': 30, 'category': 'warning', 'name': 'Blood in vomit or stool'},
    'lethargy-restlessness': {'weight': 18, 'category': 'warning', 'name': 'Extreme drowsiness / restlessness'},
    'rapid-breathing': {'weight': 16, 'category': 'warning', 'name': 'Rapid or difficult breathing'},
    'skin-paleness': {'weight': 15, 'category': 'warning', 'name': 'Skin paleness'},
}

def _compute_enhanced_dengue_probability(symptoms_list):
    if not symptoms_list:
        return {
            'percentage': 0,
            'risk_level': 'none',
            'breakdown': {
                'core_symptoms': 0,
                'warning_signs': 0,
                'additional_features': 0,
                'total_weight': 0
            },
            'selected_symptoms': []
        }
    
    core_weight = 0
    warning_weight = 0
    additional_weight = 0
    selected_symptom_details = []
    
    for symptom in symptoms_list:
        if symptom in ENHANCED_SYMPTOMS_DATA:
            data = ENHANCED_SYMPTOMS_DATA[symptom]
            selected_symptom_details.append({
                'name': data['name'],
                'weight': data['weight'],
                'category': data['category']
            })
            
            if data['category'] == 'core':
                core_weight += data['weight']
            elif data['category'] == 'warning':
                warning_weight += data['weight']
            elif data['category'] == 'additional':
                additional_weight += data['weight']
    
    total_weight = core_weight + warning_weight + additional_weight
    
    base_percentage = min(100, (total_weight / 290) * 100)
    
    multiplier = 1.0
    
    if 'fever-high' in symptoms_list:
        multiplier += 0.3
    
    warning_count = len([s for s in symptoms_list if ENHANCED_SYMPTOMS_DATA.get(s, {}).get('category') == 'warning'])
    if warning_count >= 3:
        multiplier += 0.5
    elif warning_count >= 2:
        multiplier += 0.3
    elif warning_count >= 1:
        multiplier += 0.2
    
    core_count = len([s for s in symptoms_list if ENHANCED_SYMPTOMS_DATA.get(s, {}).get('category') == 'core'])
    if core_count >= 6:
        multiplier += 0.4
    elif core_count >= 4:
        multiplier += 0.2
    elif core_count >= 2:
        multiplier += 0.1
    
    respiratory_absence = len([s for s in symptoms_list if s in ['no-cough', 'no-sore-throat']])
    if respiratory_absence == 2:
        multiplier += 0.2
    elif respiratory_absence == 1:
        multiplier += 0.1
    
    final_percentage = min(100, base_percentage * multiplier)
    
    if final_percentage >= 80:
        risk_level = 'very_high'
    elif final_percentage >= 60:
        risk_level = 'high'
    elif final_percentage >= 40:
        risk_level = 'moderate'
    elif final_percentage >= 20:
        risk_level = 'low'
    elif final_percentage >= 5:
        risk_level = 'very_low'
    else:
        risk_level = 'minimal'
    
    return {
        'percentage': round(final_percentage, 1),
        'risk_level': risk_level,
        'breakdown': {
            'core_symptoms': core_weight,
            'warning_signs': warning_weight,
            'additional_features': additional_weight,
            'total_weight': total_weight,
            'base_percentage': round(base_percentage, 1),
            'multiplier': round(multiplier, 2),
            'symptom_counts': {
                'core': core_count,
                'warning': warning_count,
                'additional': respiratory_absence
            }
        },
        'selected_symptoms': selected_symptom_details
    }

def _compute_dengue_probability_from_symptoms(symptoms_list, target_prevalence=None):
    
    enhanced_result = _compute_enhanced_dengue_probability(symptoms_list)
    
    if USE_DB_FUNCTIONS:
        db = get_db()
        try:
            result = db.execute(text("SELECT calculate_dengue_probability(:symptoms, :prevalence) as result"), {
                'symptoms': json.dumps(symptoms_list),
                'prevalence': target_prevalence or 0.055
            }).fetchone()
            
            if result:
                db_result = result[0]
                db_result.update(enhanced_result)
                return db_result
        except Exception as e:
            print(f"Database function failed, using local calculation: {e}")
        finally:
            db.close()
    
    s = set(symptoms_list or [])
    
    x = {
        'petechiae': 1 if 'petechiae' in s else 0,
        'retro_ocular_pain': 1 if 'retro-orbital-pain' in s else 0,
        'gingival_bleeding': 1 if 'gingival-bleeding' in s or 'bleeding-gums-nose' in s else 0,
        'epistaxis': 1 if 'epistaxis' in s or 'bleeding-gums-nose' in s else 0,
        'skin_paleness': 1 if 'skin-paleness' in s else 0,
    }

    coeffs = {
        'intercept': 0.694,
        'petechiae': 0.718,
        'retro_ocular_pain': 0.516,
        'gingival_bleeding': 0.316,
        'epistaxis': -0.474,
        'skin_paleness': -0.535,
    }

    y_dev = (
        coeffs['intercept']
        + coeffs['petechiae'] * x['petechiae']
        + coeffs['retro_ocular_pain'] * x['retro_ocular_pain']
        + coeffs['gingival_bleeding'] * x['gingival_bleeding']
        + coeffs['epistaxis'] * x['epistaxis']
        + coeffs['skin_paleness'] * x['skin_paleness']
    )
    p_dev = 1.0 / (1.0 + math.exp(-y_dev))

    dev_prev = 0.71
    logit_offset = 0.0
    pi0 = None
    if isinstance(target_prevalence, (int, float)):
        pi0 = max(1e-6, min(1.0 - 1e-6, float(target_prevalence)))
        logit_offset = _logit(pi0) - _logit(dev_prev)

    y = y_dev + logit_offset
    p = 1.0 / (1.0 + math.exp(-y))

    model_info = {
        'auc': 0.663,
        'auc_ci': (0.616, 0.710),
        'reported_sensitivity': 0.862,
        'reported_specificity': 0.27,
        'explored_threshold': 0.60,
        'notes': (
            'Equation and AUC from Fernández et al. (2016). The paper reports sensitivity 86.2% and '
            'specificity 27% for the model and discusses raising the cut-point from 0.5 to 0.6 to improve '
            'specificity while maintaining sensitivity >85%. We present these values transparently; '
            'they are not a diagnosis.'
        ),
        'source_url': 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5120437/',
        'cdc_features_url': 'https://www.cdc.gov/dengue/hcp/clinical-signs/index.html',
        'prevalence': {
            'development_prevalence': dev_prev,
            'target_prevalence': pi0,
            'logit_offset_applied': logit_offset,
            'target_prevalence_source_url': 'https://pmc.ncbi.nlm.nih.gov/articles/PMC2861403/'
        }
    }
    
    # Merge original model with enhanced results
    original_result = {
        'y_dev': y_dev,
        'y': y,
        'p': p,
        'p_dev': p_dev,
        'inputs': x,
        'coeffs': coeffs,
        'model_info': model_info
    }
    
    # Combine both results
    original_result.update(enhanced_result)
    return original_result

# Simple login-required decorator for pages that should tie to user accounts
def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if not session.get('logged_in'):
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return wrapper

def _compute_display_risk(prob, symptoms):
    if USE_DB_FUNCTIONS:
        db = get_db()
        try:
            result = db.execute(text("SELECT determine_risk_level(:prob, :symptoms) as risk_level"), {
                'prob': prob,
                'symptoms': json.dumps(symptoms)
            }).fetchone()
            
            if result:
                return result[0]
        except Exception as e:
            print(f"Database function failed, using local calculation: {e}")
        finally:
            db.close()
    
    s = set(symptoms or [])
    
    if prob >= 0.60:
        base = 'high'
    elif prob >= 0.30:
        base = 'moderate'
    else:
        base = 'low'

    warning = {
        'severe-abdominal-pain', 'persistent-vomiting', 'gingival-bleeding', 'epistaxis',
        'blood-in-vomit-stool', 'lethargy-restlessness', 'rapid-breathing', 'skin-paleness'
    }
    wcount = len(s.intersection(warning))
    if wcount >= 2:
        return 'high'
    if wcount == 1 and base == 'low':
        return 'moderate'
    
    core = {
        'fever-high', 'severe-headache', 'retro-orbital-pain', 'myalgia', 'arthralgia', 'rash', 'nausea-vomit'
    }
    ccount = len(s.intersection(core))
    if ccount >= 5 and base != 'high':
        return 'high'
    if ccount >= 3 and base == 'low':
        return 'moderate'
    
    return base

def _compute_clinical_probability(symptoms, base_prev):
    s = set(symptoms or [])
    core = {
        'fever-high', 'severe-headache', 'retro-orbital-pain', 'myalgia', 'arthralgia', 'rash', 'nausea-vomit'
    }
    resp_abs = {'no-cough', 'no-sore-throat'}
    warning = {
        'severe-abdominal-pain', 'persistent-vomiting', 'gingival-bleeding', 'epistaxis',
        'blood-in-vomit-stool', 'lethargy-restlessness', 'rapid-breathing', 'skin-paleness'
    }
    ccount = len(s.intersection(core))
    rcnt = len(s.intersection(resp_abs))
    wcount = len(s.intersection(warning))

    b0 = _logit(max(1e-6, min(1-1e-6, base_prev)))
    y = b0 + 0.35 * ccount + 0.40 * rcnt + 0.90 * wcount
    p = 1.0 / (1.0 + math.exp(-y))
    return {
        'p': p,
        'y': y,
        'counts': {'core': ccount, 'resp_abs': rcnt, 'warning': wcount}
    }

@app.context_processor
def inject_globals():
    avatar_url = None
    try:
        if session.get('logged_in'):
            db = get_db()
            try:
                user = db.query(User).filter(User.id == session.get('user_id')).first()
                if user and user.avatar_url:
                    avatar_url = user.avatar_url
            finally:
                db.close()
    except Exception:
        avatar_url = None
    return {
        'logged_in': session.get('logged_in', False),
        'current_year': datetime.now().year,
        'avatar_url': avatar_url,
    }

@app.route('/', methods=['GET'])
def landing_page():
    if session.get('logged_in'):
        return redirect(url_for('dashboard'))
    # Serve the built React landing page with 3D animations
    index_path = os.path.join(dist_dir, 'index.html')
    if os.path.exists(index_path):
        return send_from_directory(dist_dir, 'index.html')
    # Fallback to static HTML if build doesn't exist
    return render_template('landing_static.html')

@app.route('/assets/<path:filename>')
def landing_assets(filename):
    # Serve built Vite assets (JS, CSS, etc.)
    assets_path = os.path.join(dist_dir, 'assets')
    if os.path.exists(os.path.join(assets_path, filename)):
        return send_from_directory(assets_path, filename)
    return ('Not found', 404)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        if session.get('logged_in'):
            return redirect(url_for('dashboard'))
        return render_template('index.html', hide_nav=True)
    email = (request.form.get('email') or '').strip().lower()
    password = request.form.get('password')
    if not email or not password:
        return redirect(url_for('login', error='invalid'))

    db = get_db()
    try:
        user = _get_user_by_email(db, email)
        if user:
            if check_password_hash(user.password_hash, password):
                session['logged_in'] = True
                session['user_id'] = str(user.id)
                session['email'] = user.email
                user.last_login = datetime.utcnow()
                db.commit()
                return redirect(url_for('dashboard'))
            else:
                return redirect(url_for('login', error='invalid'))
        else:
            return redirect(url_for('register', email=email))
    finally:
        db.close()

@app.route('/logout')
def logout():
    try:
        session.clear()
    except Exception:
        session.pop('logged_in', None)
        session.pop('user_id', None)
        session.pop('email', None)
    return redirect(url_for('login'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'GET':
        if session.get('logged_in'):
            return redirect(url_for('dashboard'))
        prefill = (request.args.get('email') or '').strip().lower()
        return render_template('register.html', hide_nav=True, email=prefill)
    
    # POST
    email = (request.form.get('email') or '').strip().lower()
    password = request.form.get('password') or ''
    confirm = request.form.get('confirm') or ''
    if not email or not password or not confirm:
        return redirect(url_for('register', email=email, error='invalid'))
    if password != confirm:
        return redirect(url_for('register', email=email, error='mismatch'))
    
    db = get_db()
    try:
        if _get_user_by_email(db, email):
            return redirect(url_for('register', email=email, error='exists'))
        user = _create_user(db, email, password)
        session['logged_in'] = True
        session['user_id'] = str(user.id)
        session['email'] = user.email
        return redirect(url_for('dashboard'))
    finally:
        db.close()

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html', hide_nav=False, page_id='dashboard')

@app.route('/education')
def education():
    return redirect(url_for('education_what_is_dengue'))

@app.route('/education/what-is-dengue')
def education_what_is_dengue():
    return render_template('education_dengue.html', hide_nav=False)

@app.route('/education/local-services')
def education_local_services():
    return render_template('education_services.html', hide_nav=False)

@app.route('/report-bite')
def report_bite():
    return render_template('report_bite.html', hide_nav=False)

@app.route('/bite-analysis-result')
def bite_analysis_result():
    return render_template('bite_analysis_result.html', hide_nav=False)

def _rgb_to_hsv_float(r, g, b):
    """r,g,b in [0,1]; return h in [0,360), s,v in [0,1]."""
    mx = max(r, g, b)
    mn = min(r, g, b)
    d = mx - mn
    h = 0.0
    if d != 0:
        if mx == r:
            h = ((g - b) / d) % 6.0
        elif mx == g:
            h = (b - r) / d + 2.0
        else:
            h = (r - g) / d + 4.0
        h *= 60.0
        if h < 0:
            h += 360.0
    s = 0.0 if mx == 0 else d / mx
    v = mx
    return h, s, v

def _analyze_image_bytes(image_bytes, roi=None):
    if Image is None:
        raise RuntimeError('Pillow not installed')
    im = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    max_w = 200
    w0, h0 = im.size
    if w0 > max_w:
        ratio = max_w / float(w0)
        im = im.resize((max_w, max(1, int(h0 * ratio))), Image.BILINEAR)
    w, h = im.size

    px = im.load()
    cx0 = int(w * 0.20); cx1 = int(w * 0.80)
    cy0 = int(h * 0.20); cy1 = int(h * 0.80)
    if isinstance(roi, dict) and 'cx' in roi and 'cy' in roi:
        rc = max(8, int(min(w, h) * float(roi.get('r', 0.25))))
        cx = int(float(roi.get('cx', 0.5)) * w)
        cy = int(float(roi.get('cy', 0.5)) * h)
        cx0 = max(0, cx - rc); cx1 = min(w - 1, cx + rc)
        cy0 = max(0, cy - rc); cy1 = min(h - 1, cy + rc)

    red = yellow = total = 0
    redC = yellowC = centerTotal = 0
    strongRed = strongRedC = 0

    gx, gy = 16, 12
    cellW = max(1, w // gx)
    cellH = max(1, h // gy)
    tileR = [0] * (gx * gy)
    tileY = [0] * (gx * gy)
    tileT = [0] * (gx * gy)

    for y in range(h):
        for x in range(w):
            r8, g8, b8 = px[x, y]
            r = r8 / 255.0
            g = g8 / 255.0
            b = b8 / 255.0
            h_deg, s, v = _rgb_to_hsv_float(r, g, b)
            if v < 0.25 or s < 0.18:
                continue

            isRedHSV = (s >= 0.24 and v >= 0.30) and (h_deg <= 15 or h_deg >= 345)
            isYellowHSV = (s >= 0.22 and v >= 0.45) and (35 <= h_deg <= 70)
            isRedRGB = (r >= 0.45) and ((r - max(g, b)) >= 0.15) and (r / (g + 1e-6) >= 1.25) and (r / (b + 1e-6) >= 1.30)
            isYellowRGB = (r >= 0.42 and g >= 0.42 and b <= 0.38) and (min(r, g) / (max(r, g) + 1e-6) >= 0.78) and ((r - b) >= 0.10) and ((g - b) >= 0.10)
            isStrongRed = (r >= 0.65 and g <= 0.35 and b <= 0.35) and ((r - max(g, b)) >= 0.18)

            isRed = (isRedHSV and isRedRGB) or isStrongRed
            isYellow = (not isRed) and (isYellowHSV and isYellowRGB)

            if isRed:
                red += 1
            elif isYellow:
                yellow += 1
            total += 1

            in_center = (cx0 <= x <= cx1 and cy0 <= y <= cy1)
            if in_center:
                centerTotal += 1
                if isRed:
                    redC += 1
                    if isStrongRed:
                        strongRedC += 1
                elif isYellow:
                    yellowC += 1

            tx = min(gx - 1, x // cellW)
            ty = min(gy - 1, y // cellH)
            ti = ty * gx + tx
            tileT[ti] += 1
            if isRed:
                tileR[ti] += 1
            elif isYellow:
                tileY[ti] += 1
            if isStrongRed:
                strongRed += 1

    tileMaxRedDensity = 0.0
    tileMaxYellowDensity = 0.0
    for i in range(len(tileT)):
        t = tileT[i]
        if not t:
            continue
        tileMaxRedDensity = max(tileMaxRedDensity, tileR[i] / t)
        tileMaxYellowDensity = max(tileMaxYellowDensity, tileY[i] / t)

    stats = {
        'red': red, 'yellow': yellow, 'total': total,
        'redC': redC, 'yellowC': yellowC, 'centerTotal': centerTotal,
        'tileMaxRedDensity': tileMaxRedDensity,
        'tileMaxYellowDensity': tileMaxYellowDensity,
        'strongRed': strongRed, 'strongRedC': strongRedC,
    }

    roiPresent = isinstance(roi, dict) and 'cx' in roi
    rFrac = (red / total) if total else 0.0
    yFrac = (yellow / total) if total else 0.0
    rFracC = (redC / centerTotal) if centerTotal else 0.0
    yFracC = (yellowC / centerTotal) if centerTotal else 0.0
    minFracGlobal = 0.008 if roiPresent else 0.02
    minFracROI = 0.015 if roiPresent else 0.05
    minTileDensity = 0.05 if roiPresent else 0.10
    strongRedOK = roiPresent and (strongRedC >= max(8, centerTotal * 0.005))
    strongRedGlobalOK = (not roiPresent) and (strongRed >= max(20, total * 0.0025)) and (tileMaxRedDensity >= 0.06)
    redOK = strongRedOK or strongRedGlobalOK or (((rFrac >= minFracGlobal) or (rFracC >= minFracROI)) and (tileMaxRedDensity >= minTileDensity) and (rFrac >= yFrac * 1.05))
    yellowOK = (not redOK) and (((yFrac >= minFracGlobal) or (yFracC >= minFracROI)) and (tileMaxYellowDensity >= minTileDensity))

    if redOK:
        res = {'text': 'Detected: red/pink area', 'cls': 'red'}
    elif yellowOK:
        res = {'text': 'Detected: yellowish area', 'cls': 'yellow'}
    else:
        res = {'text': 'No clear red/yellow detected', 'cls': 'muted'}

    return stats, res

@app.route('/api/analyze-bite', methods=['POST'])
def api_analyze_bite():
    try:
        roi = None
        if request.is_json:
            body = request.get_json(silent=True) or {}
            roi = body.get('roi')
            data_url = body.get('imageDataUrl') or ''
            image_bytes = None
            if isinstance(data_url, str) and 'base64,' in data_url:
                b64 = data_url.split('base64,', 1)[1]
                image_bytes = base64.b64decode(b64)
        else:
            roi_raw = request.form.get('roi')
            if roi_raw:
                try:
                    roi = json.loads(roi_raw)
                except Exception:
                    roi = None
            image = request.files.get('image')
            image_bytes = image.read() if image else None

        if not image_bytes:
            return {'ok': False, 'error': 'No image provided'}, 400

        stats, res = _analyze_image_bytes(image_bytes, roi=roi)

        up_dir = os.path.join(BASE_DIR, 'public', 'uploads', 'bites')
        os.makedirs(up_dir, exist_ok=True)
        fname = f"{uuid.uuid4().hex}.jpg"
        try:
            if Image is None:
                raise RuntimeError('Pillow not installed')
            im = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            im.save(os.path.join(up_dir, fname), format='JPEG', quality=92)
            image_url = f"/uploads/bites/{fname}"
        except Exception:
            image_url = None

        db = get_db()
        try:
            analysis = BiteAnalysis(
                user_id=session.get('user_id'),
                created_at=datetime.utcnow(),
                label_text=res.get('text'),
                label_class=res.get('cls'),
                red_pixels=stats.get('red', 0),
                yellow_pixels=stats.get('yellow', 0),
                total_pixels=stats.get('total', 0),
                red_center_pixels=stats.get('redC', 0),
                yellow_center_pixels=stats.get('yellowC', 0),
                center_total_pixels=stats.get('centerTotal', 0),
                tile_max_red_density=stats.get('tileMaxRedDensity', 0),
                tile_max_yellow_density=stats.get('tileMaxYellowDensity', 0),
                strong_red_pixels=stats.get('strongRed', 0),
                strong_red_center_pixels=stats.get('strongRedC', 0),
                roi_center_x=roi.get('cx') if roi else None,
                roi_center_y=roi.get('cy') if roi else None,
                roi_radius=roi.get('r') if roi else None,
                analysis_stats=stats,
                image_url=image_url
            )
            db.add(analysis)
            db.commit()
            analysis_id = str(analysis.id)
        except Exception as e:
            print(f"Error saving analysis to database: {e}")
            analysis_id = str(uuid.uuid4())
        finally:
            db.close()

        return {
            'ok': True,
            'labelText': res.get('text'),
            'labelCls': res.get('cls'),
            'stats': stats,
            'roi': roi,
            'image_url': image_url,
            'analysis_id': analysis_id,
        }
    except Exception as e:
        return {'ok': False, 'error': str(e)}, 500

@app.route('/api/analysis/<analysis_id>', methods=['GET'])
def api_get_analysis(analysis_id):
    try:
        db = get_db()
        try:
            analysis = db.query(BiteAnalysis).filter(BiteAnalysis.id == analysis_id).first()
            if not analysis:
                return {'ok': False, 'error': 'not_found'}, 404
            
            return {
                'ok': True,
                'id': str(analysis.id),
                'created_at': analysis.created_at.isoformat() + 'Z',
                'labelText': analysis.label_text,
                'labelCls': analysis.label_class,
                'stats': analysis.analysis_stats or {},
                'roi': {
                    'cx': float(analysis.roi_center_x) if analysis.roi_center_x else None,
                    'cy': float(analysis.roi_center_y) if analysis.roi_center_y else None,
                    'r': float(analysis.roi_radius) if analysis.roi_radius else None,
                } if analysis.roi_center_x else None,
                'image_url': analysis.image_url,
            }
        finally:
            db.close()
    except Exception as e:
        return {'ok': False, 'error': str(e)}, 500

@app.route('/risk-assessment')
@login_required
def risk_assessment():
    symptoms = request.args.getlist('symptoms')
    from_form = len(symptoms) > 0

    db = get_db()
    try:
        try:
            if not from_form:
                last = _get_last_assessment(db, session.get('user_id'), require_symptoms=True)
                if last:
                    symptoms = last.symptoms
                else:
                    sess_syms = session.get('last_symptoms') or []
                    if sess_syms:
                        symptoms = sess_syms
                    else:
                        return redirect(url_for('symptom_checker'))
        except Exception as e:
            # Continue with safe defaults; downstream code will handle rendering
            print(f"Risk assessment pre-processing error: {e}")
        
        user_prev = _get_user_pretest_prevalence(db, session.get('user_id'))
        default_prev = 0.055  # Gregory et al. 2010
        target_prev = user_prev if isinstance(user_prev, (int, float)) else default_prev

        calc = _compute_dengue_probability_from_symptoms(symptoms, target_prevalence=target_prev)
        prob = calc.get('p', 0)
        prob_pct = round(prob * 100)
        
        enhanced_percentage = calc.get('percentage', prob_pct)
        enhanced_risk_level = calc.get('risk_level', 'low')
        
        clinical = _compute_clinical_probability(symptoms, target_prev)
        p_clinical = clinical['p']
        p_clinical_pct = round(p_clinical * 100)

        current_risk = _compute_display_risk(prob, symptoms)

        bite_label = (request.args.get('bite') or '').strip().lower() or None
        analysis_id = (request.args.get('aid') or '').strip() or None
        if (not bite_label) and analysis_id:
            try:
                # Fetch from database if available
                analysis = db.query(BiteAnalysis).filter(BiteAnalysis.id == analysis_id).first()
                if analysis and analysis.label_class and analysis.label_class.lower() in ('red', 'yellow'):
                    bite_label = analysis.label_class.lower()
            except Exception as e:
                print(f"Bite analysis lookup failed: {e}")

        bite_adjustment = 0.0
        if bite_label == 'red':
            bite_adjustment = 12.0  # stronger boost for red/pink area
        elif bite_label == 'yellow':
            bite_adjustment = 5.0   # mild boost for yellowish area

        enhanced_percentage_val = float(calc.get('percentage', prob_pct))
        enhanced_percentage_val = min(100.0, round(enhanced_percentage_val + bite_adjustment, 1))
        if enhanced_percentage_val >= 80:
            enhanced_risk_level_val = 'very_high'
        elif enhanced_percentage_val >= 60:
            enhanced_risk_level_val = 'high'
        elif enhanced_percentage_val >= 40:
            enhanced_risk_level_val = 'moderate'
        elif enhanced_percentage_val >= 20:
            enhanced_risk_level_val = 'low'
        elif enhanced_percentage_val >= 5:
            enhanced_risk_level_val = 'very_low'
        else:
            enhanced_risk_level_val = 'minimal'

        if from_form:
            try:
                session['last_symptoms'] = list(symptoms)
            except Exception:
                pass

            try:
                raw_user_id = session.get('user_id')
                if raw_user_id:
                    try:
                        user_uuid = uuid.UUID(str(raw_user_id))
                    except Exception:
                        user_uuid = raw_user_id  # fallback; SQLAlchemy may coerce if already UUID

                    assessment = Assessment(
                        user_id=user_uuid,
                        created_at=datetime.utcnow(),
                        symptoms=list(symptoms) if isinstance(symptoms, (list, tuple)) else [],
                        model='fernandez2016',
                        probability=float(calc['p']),
                        probability_dev=float(calc.get('p_dev', 0) or 0.0),
                        clinical_probability=float(p_clinical),
                        model_inputs=calc.get('inputs', {}),
                        model_coefficients=calc.get('coeffs', {}),
                        model_info=calc.get('model_info', {}),
                        risk_level=str(current_risk),
                        pretest_prevalence=float(target_prev) if target_prev is not None else None,
                        target_prevalence=float(target_prev) if target_prev is not None else None,
                        logit_offset_applied=float(
                            (calc.get('model_info', {})
                                 .get('prevalence', {})
                                 .get('logit_offset_applied', 0) or 0.0)
                        )
                    )
                    db.add(assessment)
                    db.commit()
            except Exception as e:
                try:
                    db.rollback()
                except Exception:
                    pass
                print(f"Error saving assessment to database: {e}")

        additional_sources = [
            {'title': 'WHO Fact Sheet: Dengue and severe dengue', 'url': 'https://www.who.int/news-room/fact-sheets/detail/dengue-and-severe-dengue'},
            {'title': 'WHO 2009 Dengue Guidelines (Handbook)', 'url': 'https://apps.who.int/iris/handle/10665/44188'},
            {'title': 'CDC – Dengue (overview)', 'url': 'https://www.cdc.gov/dengue/'},
            {'title': 'CDC – Clinical Testing Guidance for Dengue', 'url': 'https://www.cdc.gov/dengue/hcp/diagnosis-testing/index.html'},
            {'title': 'ECDC – Dengue fever', 'url': 'https://www.ecdc.europa.eu/en/dengue-fever'},
            {'title': 'PAHO – Dengue', 'url': 'https://www.paho.org/en/topics/dengue'},
        ]
        
        try:
            offset_applied = float((calc.get('model_info', {})
                                     .get('prevalence', {})
                                     .get('logit_offset_applied', 0)) or 0)
        except Exception:
            offset_applied = 0.0

        return render_template(
            'risk_assessment.html',
            current_risk=current_risk,
            prob_pct=prob_pct,
            enhanced_percentage=enhanced_percentage_val,
            enhanced_risk_level=enhanced_risk_level_val,
            calc=calc,
            p_dev_pct=round(calc.get('p_dev', 0) * 100),
            p_clinical_pct=p_clinical_pct,
            clinical_counts=clinical['counts'],
            selected_symptoms=symptoms,
            offset_applied=offset_applied,
            bite_label=bite_label,
            bite_adjustment=round(bite_adjustment, 1),
            analysis_id=analysis_id,
            additional_sources=additional_sources,
            hide_nav=False
        )
    except Exception as e:
        try:
            db.rollback()
        except Exception:
            pass
        print(f"Risk assessment error: {e}")
        safe_calc = {'p': 0.0, 'p_dev': 0.0, 'model_info': {'prevalence': {}}}
        safe_clinical = {'counts': {'core': 0, 'resp_abs': 0, 'warning': 0}}
        return render_template(
            'risk_assessment.html',
            current_risk='low',
            prob_pct=0,
            calc=safe_calc,
            p_dev_pct=0,
            p_clinical_pct=0,
            clinical_counts=safe_clinical['counts'],
            selected_symptoms=symptoms,
            offset_applied=0.0,
            additional_sources=[],
            hide_nav=False,
            error=str(e)
        )
    finally:
        db.close()

@app.route('/symptom-checker')
@login_required
def symptom_checker():
    db = get_db()
    try:
        last = _get_last_assessment(db, session.get('user_id'), require_symptoms=True)
        preselected = last.symptoms if last else (session.get('last_symptoms') or [])
        return render_template('symptom_checker.html', hide_nav=False, preselected=preselected)
    finally:
        db.close()

@app.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    db = get_db()
    try:
        user = db.query(User).filter(User.id == session.get('user_id')).first()
        
        if request.method == 'POST':
            phone = (request.form.get('phone') or '').strip()
            location = (request.form.get('location') or '').strip()
            birthdate = (request.form.get('birthdate') or '').strip()
            
            if user is not None:
                user.phone = phone
                user.location = location
                if birthdate:
                    try:
                        user.birthdate = datetime.strptime(birthdate, '%Y-%m-%d')
                    except ValueError:
                        pass
                
                try:
                    file = request.files.get('avatar')
                    if file and getattr(file, 'filename', ''):
                        ext = os.path.splitext(file.filename)[1].lower()
                        if ext in ('.jpg', '.jpeg', '.png', '.gif', '.webp'):
                            up_dir = os.path.join(BASE_DIR, 'public', 'uploads', 'avatars')
                            os.makedirs(up_dir, exist_ok=True)
                            filename = f"{user.id}{ext}"
                            save_path = os.path.join(up_dir, filename)
                            file.save(save_path)
                            user.avatar_url = f"/uploads/avatars/{filename}"
                except Exception as e:
                    print(f"Error saving avatar: {e}")
                
                db.commit()
            return redirect(url_for('profile'))
        
        # GET
        email = session.get('email') or (user.email if user else '')
        phone = user.phone if user else ''
        location = user.location if user else ''
        birthdate = user.birthdate.strftime('%Y-%m-%d') if user and user.birthdate else ''
        avatar_url = user.avatar_url if user else None
        
        return render_template('profile.html', hide_nav=False, email=email, phone=phone, location=location, birthdate=birthdate, avatar_url=avatar_url)
    finally:
        db.close()

@app.route('/settings')
def settings():
    db = get_db()
    try:
        uid = session.get('user_id')
        user_prev = None
        if uid:
            user = db.query(User).filter(User.id == uid).first()
            user_prev = float(user.pretest_prevalence) if user and user.pretest_prevalence else None
        
        return render_template('settings.html', hide_nav=False, user_prev=user_prev, default_prev=0.055)
    finally:
        db.close()

@app.route('/settings/prevalence', methods=['POST'])
@login_required
def update_prevalence():
    val = request.form.get('pretest_prevalence', '').strip()
    if not val:
        return redirect(url_for('settings'))
    
    try:
        x = float(val)
        # If looks like a percentage, convert to fraction
        if x > 1.0:
            x = x / 100.0
        # Clamp sensible bounds
        x = max(0.0001, min(0.95, x))
    except Exception:
        return redirect(url_for('settings'))

    db = get_db()
    try:
        user = db.query(User).filter(User.id == session.get('user_id')).first()
        if user:
            user.pretest_prevalence = x
            db.commit()
    finally:
        db.close()
    
    return redirect(url_for('settings'))

@app.route('/api/symptom-combinations', methods=['GET'])
def api_symptom_combinations():
    try:
        import itertools
        
        single_symptoms = []
        for symptom, data in ENHANCED_SYMPTOMS_DATA.items():
            result = _compute_enhanced_dengue_probability([symptom])
            single_symptoms.append({
                'symptom': symptom,
                'name': data['name'],
                'category': data['category'],
                'weight': data['weight'],
                'percentage': result['percentage'],
                'risk_level': result['risk_level']
            })
        
        single_symptoms.sort(key=lambda x: x['percentage'], reverse=True)
        
        all_symptoms = list(ENHANCED_SYMPTOMS_DATA.keys())
        high_risk_combos = []
        
        for r in range(1, 5):
            for combo in itertools.combinations(all_symptoms, r):
                result = _compute_enhanced_dengue_probability(list(combo))
                if result['percentage'] >= 60:
                    high_risk_combos.append({
                        'symptoms': list(combo),
                        'symptom_names': [ENHANCED_SYMPTOMS_DATA[s]['name'] for s in combo],
                        'count': len(combo),
                        'percentage': result['percentage'],
                        'risk_level': result['risk_level']
                    })
        
        high_risk_combos.sort(key=lambda x: x['percentage'], reverse=True)
        
        all_symptoms_result = _compute_enhanced_dengue_probability(all_symptoms)
        
        key_combinations = []
        
        core_symptoms = [s for s, data in ENHANCED_SYMPTOMS_DATA.items() if data['category'] == 'core']
        result = _compute_enhanced_dengue_probability(core_symptoms)
        key_combinations.append({
            'name': 'All Core Symptoms',
            'symptoms': core_symptoms,
            'percentage': result['percentage'],
            'risk_level': result['risk_level']
        })
        
        warning_symptoms = [s for s, data in ENHANCED_SYMPTOMS_DATA.items() if data['category'] == 'warning']
        result = _compute_enhanced_dengue_probability(warning_symptoms)
        key_combinations.append({
            'name': 'All Warning Signs',
            'symptoms': warning_symptoms,
            'percentage': result['percentage'],
            'risk_level': result['risk_level']
        })
        
        classic_dengue = ['fever-high', 'severe-headache', 'retro-orbital-pain', 'myalgia', 'nausea-vomit']
        result = _compute_enhanced_dengue_probability(classic_dengue)
        key_combinations.append({
            'name': 'Classic Dengue Presentation',
            'symptoms': classic_dengue,
            'percentage': result['percentage'],
            'risk_level': result['risk_level']
        })
        
        severe_dengue = ['fever-high', 'severe-abdominal-pain', 'persistent-vomiting', 'gingival-bleeding', 'petechiae']
        result = _compute_enhanced_dengue_probability(severe_dengue)
        key_combinations.append({
            'name': 'Severe Dengue Indicators',
            'symptoms': severe_dengue,
            'percentage': result['percentage'],
            'risk_level': result['risk_level']
        })
        
        return jsonify({
            'ok': True,
            'single_symptoms': single_symptoms,
            'high_risk_combinations': high_risk_combos[:50],  # Limit to top 50
            'all_symptoms_result': {
                'percentage': all_symptoms_result['percentage'],
                'risk_level': all_symptoms_result['risk_level'],
                'breakdown': all_symptoms_result['breakdown']
            },
            'key_combinations': key_combinations,
            'total_symptoms': len(ENHANCED_SYMPTOMS_DATA)
        })
        
    except Exception as e:
        return {'ok': False, 'error': str(e)}, 500

@app.route('/api/calculate-risk', methods=['POST'])
def api_calculate_risk():
    try:
        data = request.get_json()
        symptoms = data.get('symptoms', [])
        
        if not isinstance(symptoms, list):
            return {'ok': False, 'error': 'symptoms must be a list'}, 400
        
        result = _compute_enhanced_dengue_probability(symptoms)
        
        return jsonify({
            'ok': True,
            'result': result
        })
        
    except Exception as e:
        return {'ok': False, 'error': str(e)}, 500

if __name__ == '__main__':
    debug_mode = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    port = int(os.getenv('PORT', 5000))
    if (not debug_mode) or os.environ.get('WERKZEUG_RUN_MAIN') == 'true':
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            try:
                s.connect(('8.8.8.8', 80))
                lan_ip = s.getsockname()[0]
            finally:
                s.close()
        except Exception:
            lan_ip = None
        desktop_url = f'http://localhost:{port}'
        mobile_url = f'http://{lan_ip}:{port}' if lan_ip else f'http://<your-lan-ip>:{port}'
        print('\nDengueTect server starting...')
        print(f'  Desktop: {desktop_url}')
        print(f'  Mobile (same Wi-Fi): {mobile_url}')
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
