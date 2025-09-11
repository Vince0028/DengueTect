from flask import Flask, render_template, request, redirect, url_for, session
from datetime import datetime
import os
import json
import uuid
import math
import socket
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps

# Serve existing Next.js public/ assets at the root path (e.g., /images/dengue-logo.png)
app = Flask(__name__, static_folder='public', static_url_path='/')
app.secret_key = 'dev-secret-key'  # NOTE: replace with a secure key for production

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

# Simple JSON DB path
BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, 'data')
DB_PATH = os.path.join(DATA_DIR, 'db.json')


def _ensure_db():
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(DB_PATH):
        # Seed with sources metadata
        seed = {
            "users": [],
            "assessments": [],
            "meta": {
                "sources": {
                    "fernandez2016": "https://pmc.ncbi.nlm.nih.gov/articles/PMC5120437/",
                    "cdc_clinical_features": "https://www.cdc.gov/dengue/hcp/clinical-signs/index.html",
                    "gregory2010_puerto_rico": "https://pmc.ncbi.nlm.nih.gov/articles/PMC2861403/"
                },
                "created_at": datetime.utcnow().isoformat() + 'Z',
                "defaults": {
                    # Default target pretest prevalence for suspected dengue among febrile patients
                    # Puerto Rico enhanced surveillance (2007–2008): 108/1955 lab-positive (~5.5%)
                    # Source: Gregory et al., 2010 (AJTMH) https://pmc.ncbi.nlm.nih.gov/articles/PMC2861403/
                    "pretest_prevalence": 0.055,
                    "prevalence_source_url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC2861403/"
                }
            }
        }
        with open(DB_PATH, 'w', encoding='utf-8') as f:
            json.dump(seed, f, indent=2)


def _load_db():
    _ensure_db()
    with open(DB_PATH, 'r', encoding='utf-8') as f:
        db = json.load(f)
    # Ensure defaults exist for backward compatibility
    meta = db.setdefault('meta', {})
    sources = meta.setdefault('sources', {})
    sources.setdefault('fernandez2016', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5120437/')
    sources.setdefault('cdc_clinical_features', 'https://www.cdc.gov/dengue/hcp/clinical-signs/index.html')
    sources.setdefault('gregory2010_puerto_rico', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC2861403/')
    defaults = meta.setdefault('defaults', {})
    defaults.setdefault('pretest_prevalence', 0.055)
    defaults.setdefault('prevalence_source_url', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC2861403/')
    return db


def _save_db(db):
    with open(DB_PATH, 'w', encoding='utf-8') as f:
        json.dump(db, f, indent=2)


def _get_user_by_email(db, email):
    for u in db.get('users', []):
        if u.get('email') == email:
            return u
    return None


def _create_user(db, email, password):
    user = {
        "id": str(uuid.uuid4()),
        "email": email,
        "password_hash": generate_password_hash(password),
        "created_at": datetime.utcnow().isoformat() + 'Z',
        "settings": {
            # Users can override this later via settings UI (future improvement)
            "pretest_prevalence": db.get('meta', {}).get('defaults', {}).get('pretest_prevalence', 0.055)
        }
    }
    db.setdefault('users', []).append(user)
    _save_db(db)
    return user


def _get_user_pretest_prevalence(db):
    """Return user-specific pretest prevalence if set, otherwise None."""
    uid = session.get('user_id')
    if not uid:
        return None
    for u in db.get('users', []):
        if u.get('id') == uid:
            return u.get('settings', {}).get('pretest_prevalence')
    return None


def _get_last_assessment(db, user_id, require_symptoms=True):
    """Return the most recent assessment for a user. If require_symptoms is True,
    skip records without a non-empty symptoms list."""
    latest = None
    for rec in db.get('assessments', []):
        if rec.get('user_id') != user_id:
            continue
        if require_symptoms and not rec.get('symptoms'):
            continue
        if latest is None or rec.get('created_at', '') > (latest.get('created_at', '') or ''):
            latest = rec
    return latest


def _logit(p):
    return math.log(p / (1.0 - p))


def _compute_dengue_probability_from_symptoms(symptoms_list, target_prevalence=None):
    """
    Evidence-based logistic model from Fernández et al. (2016):
    Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC5120437/
    Equation: y = 0.694 + 0.718(petechiae) + 0.516(retro-ocular pain) + 0.316(gingival bleeding)
                     - 0.474(epistaxis) - 0.535(skin paleness)
    Probability p = 1/(1+exp(-y))

    Note: Only symptoms present in the equation are used here. Others are collected for context.
    """
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

    # Recalibrate intercept to target pretest prevalence (calibration-in-the-large)
    # Development dataset prevalence approximately 71% (390/548 positive) per Fernández et al. (2016)
    # Ref: https://pmc.ncbi.nlm.nih.gov/articles/PMC5120437/ (Results)
    dev_prev = 0.71
    offset = 0.0
    pi0 = None
    if isinstance(target_prevalence, (int, float)):
        # Clamp to (0,1)
        pi0 = max(1e-6, min(1.0 - 1e-6, float(target_prevalence)))
        offset = _logit(pi0) - _logit(dev_prev)

    y = y_dev + offset
    p = 1.0 / (1.0 + math.exp(-y))

    # Model performance as reported (for transparency)
    model_info = {
        'auc': 0.663,  # 95% CI 0.616–0.710 (Fernández et al., 2016)
        'auc_ci': (0.616, 0.710),
        # Reported overall sensitivity and specificity for the model
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
            'offset_applied': offset,
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


# Simple login-required decorator for pages that should tie to user accounts
def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if not session.get('logged_in'):
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return wrapper


def _compute_display_risk(prob, symptoms):
    """Combine model probability with WHO/CDC warning signs to determine display risk.
    Rules:
      - Probability thresholds: >=0.60 -> high, >=0.30 -> moderate.
      - Escalate based on warning signs (counts):
          * severe-abdominal-pain, persistent-vomiting, gingival-bleeding, epistaxis,
            blood-in-vomit-stool, lethargy-restlessness, rapid-breathing, skin-paleness
        If >=2 warning signs -> high; if >=1 -> at least moderate.
    """
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


def _compute_clinical_probability(symptoms, base_prev):
    """Heuristic clinical-only probability that increases with more core features and warning signs.
    IMPORTANT: This is not a validated model; it is a monotonic heuristic for UI feedback.
    We anchor the intercept to the chosen pretest prevalence so the baseline matches context.
    """
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
    # Chosen weights to provide intuitive monotonic growth
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
    return {
        'logged_in': session.get('logged_in', False),
        'current_year': datetime.now().year,
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
    # Basic JSON-backed login (demo only; not production-grade)
    email = (request.form.get('email') or '').strip().lower()
    password = request.form.get('password')
    if not email or not password:
        return redirect(url_for('index', error='invalid'))

    db = _load_db()
    user = _get_user_by_email(db, email)
    if user:
        if check_password_hash(user.get('password_hash', ''), password):
            session['logged_in'] = True
            session['user_id'] = user['id']
            session['email'] = user['email']
            return redirect(url_for('dashboard'))
        else:
            # Invalid password
            return redirect(url_for('index', error='invalid'))
    else:
        # No account — send user to register flow with prefilled email
        return redirect(url_for('register', email=email))


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
        # We pass hide_nav=True to keep focus on the form, similar to login
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
    db = _load_db()
    if _get_user_by_email(db, email):
        return redirect(url_for('register', email=email, error='exists'))
    user = _create_user(db, email, password)
    session['logged_in'] = True
    session['user_id'] = user['id']
    session['email'] = user['email']
    return redirect(url_for('dashboard'))


@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html', hide_nav=False, page_id='dashboard')


@app.route('/education')
def education():
    # Redirect to the primary education page to avoid the intermediate hub
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


@app.route('/risk-assessment')
@login_required
def risk_assessment():
    # Compute probability using evidence-based logistic model (Fernández et al., 2016)
    symptoms = request.args.getlist('symptoms')
    from_form = len(symptoms) > 0

    db = _load_db()
    if not from_form:
        # Reuse last saved assessment's symptoms for this user when directly visiting the page
        last = _get_last_assessment(db, session.get('user_id'), require_symptoms=True)
        if last:
            symptoms = last.get('symptoms', [])
        else:
            # Fallback to session-stored last symptoms
            sess_syms = session.get('last_symptoms') or []
            if sess_syms:
                symptoms = sess_syms
            else:
                # No prior assessment with symptoms; send user to the form
                return redirect(url_for('symptom_checker'))
    # Determine target pretest prevalence: user setting if available, else global default
    user_prev = _get_user_pretest_prevalence(db)
    default_prev = db.get('meta', {}).get('defaults', {}).get('pretest_prevalence', 0.055)
    target_prev = user_prev if isinstance(user_prev, (int, float)) else default_prev

    calc = _compute_dengue_probability_from_symptoms(symptoms, target_prevalence=target_prev)
    prob = calc['p']
    prob_pct = round(prob * 100)
    # Clinical-only heuristic probability for UX (non-validated)
    clinical = _compute_clinical_probability(symptoms, target_prev)
    p_clinical = clinical['p']
    p_clinical_pct = round(p_clinical * 100)

    # Determine display risk combining probability and CDC/WHO warning signs
    current_risk = _compute_display_risk(prob, symptoms)

    # Persist assessment to JSON DB only if new symptoms came from the form
    if from_form:
        try:
            session['last_symptoms'] = list(symptoms)
        except Exception:
            pass
        record = {
            'id': str(uuid.uuid4()),
            'user_id': session.get('user_id'),
            'email': session.get('email'),
            'created_at': datetime.utcnow().isoformat() + 'Z',
            'symptoms': symptoms,
            'model': 'fernandez2016',
            'calc': {
                'y_dev': calc['y_dev'],
                'y': calc['y'],
                'p': prob,
                'p_dev': calc['p_dev'],
                'inputs': calc['inputs'],
                'coeffs': calc['coeffs'],
                'model_info': calc['model_info'],
                'clinical': clinical
            },
            'risk_level_display': current_risk
        }
        db.setdefault('assessments', []).append(record)
        _save_db(db)

    # Provide additional variables for template transparency
    additional_sources = [
        { 'title': 'WHO Fact Sheet: Dengue and severe dengue', 'url': 'https://www.who.int/news-room/fact-sheets/detail/dengue-and-severe-dengue' },
        { 'title': 'WHO 2009 Dengue Guidelines (Handbook)', 'url': 'https://apps.who.int/iris/handle/10665/44188' },
        { 'title': 'CDC – Dengue (overview)', 'url': 'https://www.cdc.gov/dengue/' },
        { 'title': 'CDC – Clinical Testing Guidance for Dengue', 'url': 'https://www.cdc.gov/dengue/hcp/diagnosis-testing/index.html' },
        { 'title': 'ECDC – Dengue fever', 'url': 'https://www.ecdc.europa.eu/en/dengue-fever' },
        { 'title': 'PAHO – Dengue', 'url': 'https://www.paho.org/en/topics/dengue' },
        { 'title': 'WHO South-East Asia – Dengue', 'url': 'https://www.who.int/southeastasia/health-topics/dengue' },
        { 'title': 'NIH MedlinePlus – Dengue', 'url': 'https://medlineplus.gov/dengue.html' },
        { 'title': 'NHS (UK) – Dengue', 'url': 'https://www.nhs.uk/conditions/dengue/' },
        { 'title': 'WHO Philippines – Dengue', 'url': 'https://www.who.int/philippines/health-topics/dengue' },
    ]
    return render_template(
        'risk_assessment.html',
        current_risk=current_risk,
        prob_pct=prob_pct,
        calc=calc,
        p_dev_pct=round(calc['p_dev'] * 100),
        p_clinical_pct=p_clinical_pct,
        clinical_counts=clinical['counts'],
        selected_symptoms=symptoms,
        additional_sources=additional_sources,
        hide_nav=False
    )


@app.route('/symptom-checker')
@login_required
def symptom_checker():
    db = _load_db()
    last = _get_last_assessment(db, session.get('user_id'), require_symptoms=True)
    preselected = last.get('symptoms', []) if last else (session.get('last_symptoms') or [])
    return render_template('symptom_checker.html', hide_nav=False, preselected=preselected)


@app.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    db = _load_db()
    uid = session.get('user_id')
    # Find current user
    user = None
    for u in db.get('users', []):
        if u.get('id') == uid:
            user = u
            break
    if request.method == 'POST':
        phone = (request.form.get('phone') or '').strip()
        location = (request.form.get('location') or '').strip()
        birthdate = (request.form.get('birthdate') or '').strip()
        if user is not None:
            prof = user.setdefault('profile', {})
            prof['phone'] = phone
            prof['location'] = location
            prof['birthdate'] = birthdate
            _save_db(db)
        return redirect(url_for('profile'))
    # GET
    email = session.get('email') or (user.get('email') if user else '')
    prof = user.get('profile', {}) if user else {}
    phone = prof.get('phone', '')
    location = prof.get('location', '')
    birthdate = prof.get('birthdate', '')
    return render_template('profile.html', hide_nav=False, email=email, phone=phone, location=location, birthdate=birthdate)


@app.route('/settings')
def settings():
    db = _load_db()
    uid = session.get('user_id')
    user_prev = None
    if uid:
        for u in db.get('users', []):
            if u.get('id') == uid:
                user_prev = u.get('settings', {}).get('pretest_prevalence')
                break
    return render_template('settings.html', hide_nav=False, user_prev=user_prev, default_prev=db.get('meta', {}).get('defaults', {}).get('pretest_prevalence'))


@app.route('/settings/prevalence', methods=['POST'])
@login_required
def update_prevalence():
    """Update user-specific pretest prevalence from settings form.
    Accepts either a fraction (0-1) or percentage (0-100)."""
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

    db = _load_db()
    uid = session.get('user_id')
    for u in db.get('users', []):
        if u.get('id') == uid:
            u.setdefault('settings', {})['pretest_prevalence'] = x
            break
    _save_db(db)
    return redirect(url_for('settings'))


if __name__ == '__main__':
    # Run with: python app.py  or  py app.py
    debug_mode = True

    # Print both desktop and mobile testing URLs (once, even with the reloader)
    if (not debug_mode) or os.environ.get('WERKZEUG_RUN_MAIN') == 'true':
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            try:
                # Doesn't actually send data; just used to discover the preferred outbound IP
                s.connect(('8.8.8.8', 80))
                lan_ip = s.getsockname()[0]
            finally:
                s.close()
        except Exception:
            lan_ip = None

        desktop_url = 'http://localhost:5000'
        mobile_url = f'http://{lan_ip}:5000' if lan_ip else 'http://<your-lan-ip>:5000'
        print('\nDengueTect server starting...')
        print(f'  Desktop: {desktop_url}')
        print(f'  Mobile (same Wi-Fi): {mobile_url}')
        print('  Tip: If it does not open on your phone, ensure both devices are on the same network and allow the Windows Firewall prompt for Python/Flask.\n')

    app.run(host='0.0.0.0', port=5000, debug=debug_mode)
