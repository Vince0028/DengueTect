from flask import Flask, render_template, request, redirect, url_for, session
from datetime import datetime

# Serve existing Next.js public/ assets at the root path (e.g., /images/dengue-logo.png)
app = Flask(__name__, static_folder='public', static_url_path='/')
app.secret_key = 'dev-secret-key'  # NOTE: replace with a secure key for production


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
    # Demo login only
    email = request.form.get('email')
    password = request.form.get('password')
    if email and password:
        session['logged_in'] = True
        return redirect(url_for('dashboard'))
    return redirect(url_for('index'))


@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    return redirect(url_for('index'))


@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html', hide_nav=False)


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
def risk_assessment():
    # Mock values to mirror the TSX page
    risk_levels = {"low": 10, "moderate": 50, "high": 85}
    current_risk = 'moderate'
    return render_template('risk_assessment.html', risk_levels=risk_levels, current_risk=current_risk, hide_nav=False)


@app.route('/symptom-checker')
def symptom_checker():
    return render_template('symptom_checker.html', hide_nav=False)


@app.route('/profile')
def profile():
    return render_template('profile.html', hide_nav=False)


@app.route('/settings')
def settings():
    return render_template('settings.html', hide_nav=False)


if __name__ == '__main__':
    # Run with: python app.py  or  py app.py
    app.run(host='0.0.0.0', port=5000, debug=True)
