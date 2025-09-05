from flask import Flask, render_template, request, redirect, url_for

# Serve existing Next.js public/ assets at the root path (e.g., /images/dengue-logo.png)
app = Flask(__name__, static_folder='public', static_url_path='/')


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


@app.route('/login', methods=['POST'])
def login():
    # Demo login only
    email = request.form.get('email')
    password = request.form.get('password')
    if email and password:
        return redirect(url_for('dashboard'))
    return redirect(url_for('index'))


@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')


@app.route('/education')
def education():
    return render_template('education.html')


@app.route('/report-bite')
def report_bite():
    return render_template('report_bite.html')


@app.route('/bite-analysis-result')
def bite_analysis_result():
    return render_template('bite_analysis_result.html')


@app.route('/risk-assessment')
def risk_assessment():
    # Mock values to mirror the TSX page
    risk_levels = {"low": 10, "moderate": 50, "high": 85}
    current_risk = 'moderate'
    return render_template('risk_assessment.html', risk_levels=risk_levels, current_risk=current_risk)


@app.route('/symptom-checker')
def symptom_checker():
    return render_template('symptom_checker.html')


@app.route('/profile')
def profile():
    return render_template('profile.html')


@app.route('/settings')
def settings():
    return render_template('settings.html')


if __name__ == '__main__':
    # Run with: python app.py  or  py app.py
    app.run(host='0.0.0.0', port=5000, debug=True)
