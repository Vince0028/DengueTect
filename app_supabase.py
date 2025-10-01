"""
DengueTect Flask Application - Supabase Version
Updated to use SQLAlchemy with PostgreSQL instead of JSON files
"""

from flask import Flask, render_template, request, redirect, url_for, session, jsonify
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
from database import SessionLocal, User, Assessment, BiteAnalysis, Symptom, calculate_dengue_probability, determine_risk_level
try:
    from PIL import Image
except Exception:
    Image = None

# Serve existing Next.js public/ assets at the root path (e.g., /images/dengue-logo.png)
app = Flask(__name__, static_folder='public', static_url_path='/')
app.secret_key = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# Disable caching for dynamic routes to prevent stale results
@app.after_request
def add_no_cache_headers(response):
    try:
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
    except Exception:
        pass
    return response

# Base directories for file uploads
BASE_DIR = os.path.dirname(__file__)
ANALYSIS_DIR = os.path.join(BASE_DIR, 'data', 'analyses')

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

def _compute_dengue_probability_from_symptoms(symptoms_list, target_prevalence=None):
    """
    Evidence-based logistic model from Fernández et al. (2016):
    Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC5120437/
    """
    db = get_db()
    try:
        # Use database function if available, otherwise compute locally
        result = db.execute(text("SELECT calculate_dengue_probability(:symptoms, :prevalence) as result"), {
            'symptoms': json.dumps(symptoms_list),
            'prevalence': target_prevalence or 0.055
        }).fetchone()
        
        if result:
            return result[0]
    except Exception as e:
        print(f"Database function failed, using local calculation: {e}")
    
    # Fallback to local calculation
    s = set(symptoms_list or [])
    
    # Map inputs (booleans 0/1)
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

    # Linear predictor using development (original) model coefficients
    y_dev = (
        coeffs['intercept']
        + coeffs['petechiae'] * x['petechiae']
        + coeffs['retro_ocular_pain'] * x['retro_ocular_pain']
        + coeffs['gingival_bleeding'] * x['gingival_bleeding']
        + coeffs['epistaxis'] * x['epistaxis']
        + coeffs['skin_paleness'] * x['skin_paleness']
    )
    p_dev = 1.0 / (1.0 + math.exp(-y_dev))

    # Recalibrate intercept to target pretest prevalence
    dev_prev = 0.71
    logit_offset = 0.0
    pi0 = None
    if isinstance(target_prevalence, (int, float)):
        pi0 = max(1e-6, min(1.0 - 1e-6, float(target_prevalence)))
        logit_offset = _logit(pi0) - _logit(dev_prev)

    y = y_dev + logit_offset
    p = 1.0 / (1.0 + math.exp(-y))

    # Model performance as reported
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

    return {
        'y_dev': y_dev,
        'y': y,
        'p': p,
        'p_dev': p_dev,
        'inputs': x,
        'coeffs': coeffs,
        'model_info': model_info
    }
    finally:
        db.close()

# Simple login-required decorator for pages that should tie to user accounts
def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if not session.get('logged_in'):
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return wrapper

def _compute_display_risk(prob, symptoms):
    """Combine model probability with WHO/CDC warning signs to determine display risk."""
    db = get_db()
    try:
        # Use database function if available
        result = db.execute(text("SELECT determine_risk_level(:prob, :symptoms) as risk_level"), {
            'prob': prob,
            'symptoms': json.dumps(symptoms)
        }).fetchone()
        
        if result:
            return result[0]
    except Exception as e:
        print(f"Database function failed, using local calculation: {e}")
    
    # Fallback to local calculation
    s = set(symptoms or [])
    
    # Base on probability
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
    
    # Core symptom burden (CDC common features)
    core = {
        'fever-high', 'severe-headache', 'retro-orbital-pain', 'myalgia', 'arthralgia', 'rash', 'nausea-vomit'
    }
    ccount = len(s.intersection(core))
    if ccount >= 5 and base != 'high':
        return 'high'
    if ccount >= 3 and base == 'low':
        return 'moderate'
    return base
    finally:
        db.close()

def _compute_clinical_probability(symptoms, base_prev):
    """Heuristic clinical-only probability that increases with more core features and warning signs."""
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

    # Logistic mapping: start at base_prev; each cluster increases log-odds
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
def index():
    # If already logged in, go straight to dashboard
    if session.get('logged_in'):
        return redirect(url_for('dashboard'))
    # Hide header navigation on the login page
    return render_template('index.html', hide_nav=True)

@app.route('/login', methods=['POST'])
def login():
    # Basic database-backed login
    email = (request.form.get('email') or '').strip().lower()
    password = request.form.get('password')
    if not email or not password:
        return redirect(url_for('index', error='invalid'))

    db = get_db()
    try:
        user = _get_user_by_email(db, email)
        if user:
            if check_password_hash(user.password_hash, password):
                session['logged_in'] = True
                session['user_id'] = str(user.id)
                session['email'] = user.email
                # Update last login
                user.last_login = datetime.utcnow()
                db.commit()
                return redirect(url_for('dashboard'))
            else:
                return redirect(url_for('index', error='invalid'))
        else:
            # No account — send user to register flow with prefilled email
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
    return redirect(url_for('index'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'GET':
        # If already logged in, go to dashboard
        if session.get('logged_in'):
            return redirect(url_for('dashboard'))
        # Show registration page
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

# --- Bite analysis API (same as original) ---
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
    # Downscale for performance while keeping aspect
    max_w = 200
    w0, h0 = im.size
    if w0 > max_w:
        ratio = max_w / float(w0)
        im = im.resize((max_w, max(1, int(h0 * ratio))), Image.BILINEAR)
    w, h = im.size

    px = im.load()
    # ROI to central box
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
            # ignore dark/low-sat; do not add to denominator
            if v < 0.25 or s < 0.18:
                continue

            # thresholds aligned with client
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

    # Decide label
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
    """Accept image and optional ROI; return analysis JSON."""
    try:
        # Parse ROI
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

        # Save image to public/uploads/bites
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

        # Save analysis to database
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
    # Compute probability using evidence-based logistic model
    symptoms = request.args.getlist('symptoms')
    from_form = len(symptoms) > 0

    db = get_db()
    try:
        if not from_form:
            # Reuse last saved assessment's symptoms for this user when directly visiting the page
            last = _get_last_assessment(db, session.get('user_id'), require_symptoms=True)
            if last:
                symptoms = last.symptoms
            else:
                # Fallback to session-stored last symptoms
                sess_syms = session.get('last_symptoms') or []
                if sess_syms:
                    symptoms = sess_syms
                else:
                    # No prior assessment with symptoms; send user to the form
                    return redirect(url_for('symptom_checker'))
        
        # Determine target pretest prevalence
        user_prev = _get_user_pretest_prevalence(db, session.get('user_id'))
        default_prev = 0.055  # Gregory et al. 2010
        target_prev = user_prev if isinstance(user_prev, (int, float)) else default_prev

        calc = _compute_dengue_probability_from_symptoms(symptoms, target_prevalence=target_prev)
        prob = calc['p']
        prob_pct = round(prob * 100)
        
        # Clinical-only heuristic probability for UX
        clinical = _compute_clinical_probability(symptoms, target_prev)
        p_clinical = clinical['p']
        p_clinical_pct = round(p_clinical * 100)

        # Determine display risk combining probability and CDC/WHO warning signs
        current_risk = _compute_display_risk(prob, symptoms)

        # Persist assessment to database only if new symptoms came from the form
        if from_form:
            try:
                session['last_symptoms'] = list(symptoms)
            except Exception:
                pass
            
            assessment = Assessment(
                user_id=session.get('user_id'),
                created_at=datetime.utcnow(),
                symptoms=symptoms,
                model='fernandez2016',
                probability=float(calc['p']),
                probability_dev=float(calc.get('p_dev', 0)),
                clinical_probability=float(p_clinical),
                model_inputs=calc.get('inputs', {}),
                model_coefficients=calc.get('coeffs', {}),
                model_info=calc.get('model_info', {}),
                risk_level=current_risk,
                pretest_prevalence=target_prev,
                target_prevalence=target_prev,
                logit_offset_applied=calc.get('model_info', {}).get('prevalence', {}).get('logit_offset_applied', 0)
            )
            db.add(assessment)
            db.commit()

        # Provide additional variables for template transparency
        additional_sources = [
            {'title': 'WHO Fact Sheet: Dengue and severe dengue', 'url': 'https://www.who.int/news-room/fact-sheets/detail/dengue-and-severe-dengue'},
            {'title': 'WHO 2009 Dengue Guidelines (Handbook)', 'url': 'https://apps.who.int/iris/handle/10665/44188'},
            {'title': 'CDC – Dengue (overview)', 'url': 'https://www.cdc.gov/dengue/'},
            {'title': 'CDC – Clinical Testing Guidance for Dengue', 'url': 'https://www.cdc.gov/dengue/hcp/diagnosis-testing/index.html'},
            {'title': 'ECDC – Dengue fever', 'url': 'https://www.ecdc.europa.eu/en/dengue-fever'},
            {'title': 'PAHO – Dengue', 'url': 'https://www.paho.org/en/topics/dengue'},
        ]
        
        return render_template(
            'risk_assessment.html',
            current_risk=current_risk,
            prob_pct=prob_pct,
            calc=calc,
            p_dev_pct=round(calc.get('p_dev', 0) * 100),
            p_clinical_pct=p_clinical_pct,
            clinical_counts=clinical['counts'],
            selected_symptoms=symptoms,
            additional_sources=additional_sources,
            hide_nav=False
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
                
                # Optional avatar upload
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
    """Update user-specific pretest prevalence from settings form."""
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

if __name__ == '__main__':
    # Run with: python app_supabase.py
    debug_mode = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    port = int(os.getenv('PORT', 5000))

    # Print both desktop and mobile testing URLs (once, even with the reloader)
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
        print('  Tip: If it does not open on your phone, ensure both devices are on the same network and allow the Windows Firewall prompt for Python/Flask.\n')

    app.run(host='0.0.0.0', port=port, debug=debug_mode)
