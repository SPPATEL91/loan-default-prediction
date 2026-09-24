# Loan Default Prediction System

A full-stack Machine Learning application for predicting loan default risk. Features a FastAPI backend serving multiple trained scikit-learn models and an interactive modern React frontend.

---

## 🚀 Features

- **Multi-Model Support**: Pre-trained classifiers including:
  - Decision Tree Classifier (Default)
  - Gaussian Naive Bayes
  - K-Nearest Neighbors (KNN)
  - Logistic Regression
  - Support Vector Classifier (SVC)
- **High-Performance FastAPI Backend**: RESTful API endpoints with schema validation via Pydantic and interactive Swagger docs.
- **Modern Responsive Frontend**: Built with React 19, Vite, and Bootstrap for seamless loan parameter input and instant risk assessment.
- **Model Explainability & Metrics**: Dynamic risk probability, prediction outcome, and model metadata.

---

## 📁 Project Structure

```text
├── backend/
│   ├── models/             # Predictor wrappers & dynamic ModelRegistry
│   ├── main.py             # FastAPI entrypoint and routes
│   ├── schemas.py          # Pydantic request/response schemas
│   ├── test_backend.py     # Backend test suite
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/                # React components & UI pages
│   ├── package.json        # Frontend dependencies & scripts
│   └── vite.config.js      # Vite build configuration
├── notebooks-containing-models/
│   ├── *.ipynb             # EDA, preprocessing, and model training notebooks
│   └── *.pkl               # Saved scikit-learn serialized models
├── data/
│   └── Loan_default.csv    # Loan default dataset
└── RUN_PROJECT.txt         # Quick reference guide
```

---

## 🛠️ Getting Started

### Prerequisites

- **Python 3.10+** (or Anaconda)
- **Node.js 18+** and **npm**

---

### 1. Backend Setup

From the root project directory:

```bash
# Create a virtual environment (optional)
python -m venv backend/venv

# Activate virtual environment
# Windows:
.\backend\venv\Scripts\activate
# Linux/macOS:
source backend/venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Start the FastAPI server
python -m uvicorn backend.main:app --reload --port 8000
```

- API Base URL: `http://localhost:8000`
- Swagger Documentation: `http://localhost:8000/docs`
- Health Endpoint: `http://localhost:8000/api/health`

---

### 2. Frontend Setup

From the `frontend/` directory:

```bash
cd frontend

# Install node packages
npm install

# Start Vite dev server
npm run dev
```

- Web UI: `http://localhost:5173`

---

## 🧪 Testing

Run automated tests for the backend:

```bash
pytest backend/test_backend.py
```

---

## 📄 License

This project is licensed under the MIT License.
