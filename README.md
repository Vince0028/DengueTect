<div align="center">
  <h1>🦟 DengueTect</h1>
  <p>
    <strong>Advanced Dengue Risk Assessment & Bite Analysis System</strong>
  </p>
  <p>
    <a href="#about">About</a> •
    <a href="#key-features">Key Features</a> •
    <a href="#technology-stack">Tech Stack</a> •
    <a href="#system-architecture">System Architecture</a> •
    <a href="#getting-started">Getting Started</a>
  </p>
  
  ![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?style=flat-square)
  ![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)
  ![Status](https://img.shields.io/badge/status-Active-success.svg?style=flat-square)
</div>

<br />

## 📖 About
**DengueTect** is a specialized health informatics application designed to assist in the early detection and risk assessment of Dengue fever. By combining a clinically-calibrated symptom checker with an automated image analysis tool for mosquito bites, DengueTect provides users with an instant, preliminary risk evaluation.

This version is a **robust Flask (Python) port**, offering a lightweight yet powerful backend that handles complex logic, image processing, and secure user management, serving a responsive frontend interface.

## ✨ Key Features

- **🩺 Clinical Risk Assessment**
  - Uses a logistic regression model based on medical literature (Fernández et al., 2016).
  - Calculates probability based on core symptoms (fever, rash, retro-ocular pain) and warning signs.
  
- **📷 AI Bite Analysis**
  - Upload photos of insect bites for instant automated analysis.
  - Utilizes HSV/RGB color space algorithms to detect characteristic redness and inflammation patterns.
  
- **📊 Interactive Dashboard**
  - Track assessment history and bite analysis results.
  - User-friendly interface for managing health data.

- **🛡️ Secure Authentication**
  - Complete user management system with secure login/registration.
  - data privacy and session handling.

- **📚 Educational Hub**
  - Integrated educational resources about Dengue prevention and local health services.

## 🛠 Technology Stack

### Backend & Logic
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![NumPy](https://img.shields.io/badge/numpy-%23013243.svg?style=for-the-badge&logo=numpy&logoColor=white)
![Pillow](https://img.shields.io/badge/Pillow-%2311557C.svg?style=for-the-badge&logo=python&logoColor=white)

### Frontend & UI
![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)

### Database & deployment
![JSON](https://img.shields.io/badge/JSON-Local_DB-lightgrey?style=for-the-badge&logo=json&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

## 🏗 System Architecture

DengueTect operates on a **Model-View-Controller (MVC) pattern** facilitated by Flask:

1.  **Application Logic (Controller):** `app.py` serves as the core controller, handling routing, request processing, and linking the database with the UI.
2.  **Data Layer (Model):** 
    -   Currently utilizes a portable **JSON-based database** (`data/db.json`) for zero-conf persistence.
    -   Contains schemas `users`, `assessments`, and `meta`.
    -   Scalable to **PostgreSQL/Supabase** (schema provided in `denguetect_supabase_schema.sql`).
3.  **Image Processing Engine:**
    -   Incoming images are processed in-memory using **Pillow**.
    -   Custom algorithms (`_analyze_image_bytes`) analyze pixel density and color gradients to identify potential inflammatory reactions typical of bites.
4.  **Risk Engine:**
    -   A mathematical model (`_compute_dengue_probability_from_symptoms`) computes risk scores using weighted coefficients derived from clinical studies.

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- **Python 3.10** or higher.
- **pip** (Python package installer).

### Installation

1.  **Clone the repository** (or download source):
    ```bash
    git clone https://github.com/yourusername/denguetect.git
    cd denguetect
    ```

2.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

### Running the Application

1.  **Start the Server**:
    Navigate to the backend directory and run the app:
    ```powershell
    cd backend
    python app.py
    ```

2.  **Access the App**:
    Open your browser and navigate to:
    ```
    http://127.0.0.1:5000
    ```

3.  **Login**:
    -   Register a new account or use existing credentials if provided.
    -   Navigate freely through the Dashboard, Symptom Checker, and Bite Analysis tools.

## 🤝 Application Structure

```
DengueTect/
├── backend/                # Flask Backend & Logic
│   ├── app.py              # Main application entry point
│   ├── database.py         # Database models
│   ├── data/               # Local database storage
│   └── templates/          # HTML Templates
├── frontend/               # Next.js Frontend Source
│   ├── app/                # App Router
│   ├── components/         # React Components
│   └── public/             # Static assets
├── landing_page/           # Landing page build source
└── README.md               # Documentation
```

---

<div align="center">
  <p>Made with ❤️ by the DengueTect Team</p>
</div>
