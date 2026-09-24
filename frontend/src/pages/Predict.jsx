/**
 * Predict.jsx
 * ===========
 * Interactive Loan Default Prediction Form & Results Dashboard.
 *
 * Concepts for learning:
 * 1. `useState`: React hook that stores mutable state (e.g. form inputs, loading state, API results).
 * 2. `useEffect`: React hook that runs side-effects when the component mounts (e.g. fetching available models from the backend).
 * 3. Form Handling: Controlled components where input values are driven by React state and updated via `onChange`.
 * 4. API Communication: Using modern `fetch()` with `async/await` to send a POST request to the FastAPI `/api/predict` endpoint.
 * 5. Conditional Rendering: Rendering loading spinners, error alerts, and the result dashboard only when corresponding state exists.
 */

import React, { useState, useEffect } from "react";

// The FastAPI backend base URL
const API_BASE_URL = "http://localhost:8000";

// Initial default state for all 16 loan application fields
const INITIAL_FORM_DATA = {
  Age: 35,
  Income: 75000,
  LoanAmount: 25000,
  CreditScore: 720,
  MonthsEmployed: 48,
  NumCreditLines: 3,
  InterestRate: 7.5,
  LoanTerm: 36,
  DTIRatio: 0.28,
  Education: "Bachelor's",
  EmploymentType: "Full-time",
  MaritalStatus: "Married",
  HasMortgage: "Yes",
  HasDependents: "No",
  LoanPurpose: "Home",
  HasCoSigner: "Yes",
};

// Preset Profiles to allow 1-click testing of different risk scenarios
const PRESET_PROFILES = {
  lowRisk: {
    Age: 48,
    Income: 98000,
    LoanAmount: 30000,
    CreditScore: 780,
    MonthsEmployed: 96,
    NumCreditLines: 4,
    InterestRate: 4.8,
    LoanTerm: 36,
    DTIRatio: 0.18,
    Education: "Master's",
    EmploymentType: "Full-time",
    MaritalStatus: "Married",
    HasMortgage: "Yes",
    HasDependents: "Yes",
    LoanPurpose: "Home",
    HasCoSigner: "Yes",
  },
  moderateRisk: {
    Age: 32,
    Income: 45000,
    LoanAmount: 35000,
    CreditScore: 610,
    MonthsEmployed: 20,
    NumCreditLines: 5,
    InterestRate: 14.5,
    LoanTerm: 48,
    DTIRatio: 0.45,
    Education: "Bachelor's",
    EmploymentType: "Full-time",
    MaritalStatus: "Single",
    HasMortgage: "No",
    HasDependents: "No",
    LoanPurpose: "Auto",
    HasCoSigner: "No",
  },
  highRisk: {
    Age: 21,
    Income: 16000,
    LoanAmount: 95000,
    CreditScore: 410,
    MonthsEmployed: 3,
    NumCreditLines: 8,
    InterestRate: 22.8,
    LoanTerm: 60,
    DTIRatio: 0.78,
    Education: "High School",
    EmploymentType: "Unemployed",
    MaritalStatus: "Single",
    HasMortgage: "No",
    HasDependents: "Yes",
    LoanPurpose: "Other",
    HasCoSigner: "No",
  },
};

function PredictPage() {
  // ---------------------------------------------------------------------------
  // REACT STATE HOOKS
  // ---------------------------------------------------------------------------
  // Stores the values entered into the form
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  // Available models registered on the FastAPI backend (e.g. Decision Tree)
  const [models, setModels] = useState([
    { id: "decision_tree", name: "Decision Tree Classifier", description: "Standard Decision Tree" }
  ]);
  const [selectedModel, setSelectedModel] = useState("decision_tree");

  // UI state for loading spinner, error messages, and prediction result
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // ---------------------------------------------------------------------------
  // FETCH REGISTERED MODELS ON MOUNT
  // ---------------------------------------------------------------------------
  useEffect(() => {
    async function fetchModels() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/models`);
        if (response.ok) {
          const data = await response.json();
          if (data.models && data.models.length > 0) {
            setModels(data.models);
            setSelectedModel(data.default_model_id || data.models[0].id);
          }
        }
      } catch (err) {
        // Backend might not be running yet, fallback silently to default decision_tree
        console.warn("Could not fetch models from backend, using default:", err);
      }
    }
    fetchModels();
  }, []);

  // ---------------------------------------------------------------------------
  // FORM HANDLERS
  // ---------------------------------------------------------------------------
  /**
   * Handles changes for all standard input and select fields.
   */
  const handleChange = (e) => {
    const { name, value, type } = e.target;

    // Convert numeric inputs to numbers or empty string
    let parsedValue = value;
    if (type === "number") {
      parsedValue = value === "" ? "" : parseFloat(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  /**
   * Applies a preset profile to the form for quick testing.
   */
  const handleApplyPreset = (presetKey) => {
    if (PRESET_PROFILES[presetKey]) {
      setFormData(PRESET_PROFILES[presetKey]);
      setError(null);
      setResult(null);
    }
  };

  /**
   * Resets form to initial values.
   */
  const handleReset = () => {
    setFormData(INITIAL_FORM_DATA);
    setError(null);
    setResult(null);
  };

  /**
   * Submits the loan application data to the FastAPI backend.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Prepare payload ensuring numbers are properly typed
    const payload = {
      Age: parseInt(formData.Age, 10),
      Income: parseFloat(formData.Income),
      LoanAmount: parseFloat(formData.LoanAmount),
      CreditScore: parseInt(formData.CreditScore, 10),
      MonthsEmployed: parseInt(formData.MonthsEmployed, 10),
      NumCreditLines: parseInt(formData.NumCreditLines, 10),
      InterestRate: parseFloat(formData.InterestRate),
      LoanTerm: parseInt(formData.LoanTerm, 10),
      DTIRatio: parseFloat(formData.DTIRatio),
      Education: formData.Education,
      EmploymentType: formData.EmploymentType,
      MaritalStatus: formData.MaritalStatus,
      HasMortgage: formData.HasMortgage,
      HasDependents: formData.HasDependents,
      LoanPurpose: formData.LoanPurpose,
      HasCoSigner: formData.HasCoSigner,
      model_id: selectedModel,
    };

    try {
      // Send HTTP POST request to FastAPI backend
      const response = await fetch(`${API_BASE_URL}/api/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Server returned error ${response.status}`);
      }

      const predictionData = await response.json();
      setResult(predictionData);

      // Smoothly scroll down to results
      setTimeout(() => {
        const resultElement = document.getElementById("prediction-result");
        if (resultElement) {
          resultElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } catch (err) {
      console.error("Prediction request failed:", err);
      setError(
        err.message ||
          "Failed to connect to the prediction backend. Please verify FastAPI is running on http://localhost:8000."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="predict-container">
      {/* 1. PAGE HEADER */}
      <div className="page-header text-start">
        <h2 className="page-title">Loan Default Risk Evaluation</h2>
        <p className="page-subtitle">
          Fill in the applicant details below to calculate default probabilities using our pre-trained Decision Tree model.
        </p>
      </div>

      {/* 2. PRESET PROFILES TOOLBAR */}
      <div className="preset-bar">
        <div className="d-flex align-items-center gap-2">
          <span className="preset-title">⚡ Quick Test Profiles:</span>
        </div>
        <div className="preset-btn-group">
          <button
            type="button"
            className="btn-preset btn-preset-success"
            onClick={() => handleApplyPreset("lowRisk")}
            title="Load a high-income, high-credit borrower profile"
          >
            🟢 Low Risk Profile
          </button>
          <button
            type="button"
            className="btn-preset"
            onClick={() => handleApplyPreset("moderateRisk")}
            title="Load a moderate risk profile"
          >
            🟡 Moderate Risk Profile
          </button>
          <button
            type="button"
            className="btn-preset btn-preset-danger"
            onClick={() => handleApplyPreset("highRisk")}
            title="Load an unemployed, high debt-ratio profile"
          >
            🔴 High Risk Profile
          </button>
          <button
            type="button"
            className="btn-preset"
            onClick={handleReset}
            title="Reset form fields to default"
          >
            🔄 Reset
          </button>
        </div>
      </div>

      {/* 3. ERROR BANNER */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center justify-content-between my-3" role="alert">
          <div>
            <strong>Connection / Validation Error:</strong> {error}
          </div>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => setError(null)}
          ></button>
        </div>
      )}

      {/* 4. MAIN PREDICTION FORM */}
      <form onSubmit={handleSubmit} className="text-start">
        {/* ===================================================================
            SECTION 1: PERSONAL & DEMOGRAPHIC INFORMATION
           =================================================================== */}
        <div className="form-section-card">
          <div className="form-section-header">
            <div className="section-icon-badge">👤</div>
            <h3 className="form-section-title">Personal &amp; Demographic Information</h3>
          </div>

          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">
                Age
                <span className="field-hint">(18 - 100)</span>
              </label>
              <input
                type="number"
                className="form-control"
                name="Age"
                min="18"
                max="100"
                required
                value={formData.Age}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Education</label>
              <select
                className="form-select"
                name="Education"
                value={formData.Education}
                onChange={handleChange}
              >
                <option value="High School">High School</option>
                <option value="Bachelor's">Bachelor's</option>
                <option value="Master's">Master's</option>
                <option value="PhD">PhD</option>
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">Marital Status</label>
              <select
                className="form-select"
                name="MaritalStatus"
                value={formData.MaritalStatus}
                onChange={handleChange}
              >
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">Has Dependents</label>
              <select
                className="form-select"
                name="HasDependents"
                value={formData.HasDependents}
                onChange={handleChange}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>
        </div>

        {/* ===================================================================
            SECTION 2: EMPLOYMENT & INCOME
           =================================================================== */}
        <div className="form-section-card">
          <div className="form-section-header">
            <div className="section-icon-badge">💼</div>
            <h3 className="form-section-title">Employment &amp; Income</h3>
          </div>

          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">
                Annual Income
                <span className="field-hint">($ USD)</span>
              </label>
              <input
                type="number"
                className="form-control"
                name="Income"
                min="0"
                step="500"
                required
                value={formData.Income}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Employment Type</label>
              <select
                className="form-select"
                name="EmploymentType"
                value={formData.EmploymentType}
                onChange={handleChange}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Self-employed">Self-employed</option>
                <option value="Unemployed">Unemployed</option>
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">
                Months Employed
                <span className="field-hint">(Experience)</span>
              </label>
              <input
                type="number"
                className="form-control"
                name="MonthsEmployed"
                min="0"
                required
                value={formData.MonthsEmployed}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* ===================================================================
            SECTION 3: CREDIT & FINANCIAL HEALTH
           =================================================================== */}
        <div className="form-section-card">
          <div className="form-section-header">
            <div className="section-icon-badge">💳</div>
            <h3 className="form-section-title">Credit &amp; Debt Profile</h3>
          </div>

          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">
                Credit Score
                <span className="field-hint">(300 - 850)</span>
              </label>
              <input
                type="number"
                className="form-control"
                name="CreditScore"
                min="300"
                max="850"
                required
                value={formData.CreditScore}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-2">
              <label className="form-label">
                Credit Lines
                <span className="field-hint">(Open)</span>
              </label>
              <input
                type="number"
                className="form-control"
                name="NumCreditLines"
                min="0"
                max="30"
                required
                value={formData.NumCreditLines}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">
                DTI Ratio
                <span className="field-hint">(0.0 - 1.0)</span>
              </label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                name="DTIRatio"
                min="0"
                max="1.0"
                required
                value={formData.DTIRatio}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-2">
              <label className="form-label">Has Mortgage</label>
              <select
                className="form-select"
                name="HasMortgage"
                value={formData.HasMortgage}
                onChange={handleChange}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label">Has Co-Signer</label>
              <select
                className="form-select"
                name="HasCoSigner"
                value={formData.HasCoSigner}
                onChange={handleChange}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>
        </div>

        {/* ===================================================================
            SECTION 4: LOAN PARTICULARS
           =================================================================== */}
        <div className="form-section-card">
          <div className="form-section-header">
            <div className="section-icon-badge">📝</div>
            <h3 className="form-section-title">Loan Specifics</h3>
          </div>

          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">
                Loan Amount
                <span className="field-hint">($ USD)</span>
              </label>
              <input
                type="number"
                className="form-control"
                name="LoanAmount"
                min="500"
                step="500"
                required
                value={formData.LoanAmount}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">
                Interest Rate
                <span className="field-hint">(% APR)</span>
              </label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                name="InterestRate"
                min="0.1"
                max="40"
                required
                value={formData.InterestRate}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">
                Loan Term
                <span className="field-hint">(Months)</span>
              </label>
              <input
                type="number"
                className="form-control"
                name="LoanTerm"
                min="6"
                max="120"
                required
                value={formData.LoanTerm}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Loan Purpose</label>
              <select
                className="form-select"
                name="LoanPurpose"
                value={formData.LoanPurpose}
                onChange={handleChange}
              >
                <option value="Auto">Auto</option>
                <option value="Business">Business</option>
                <option value="Education">Education</option>
                <option value="Home">Home</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* ===================================================================
            SUBMIT & MODEL SELECTION BAR
           =================================================================== */}
        <div className="submit-card">
          <div className="d-flex align-items-center gap-3">
            <label className="form-label mb-0 fw-bold">Active ML Model:</label>
            <select
              className="form-select w-auto"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  🌲 {m.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-predict"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-small"></span>
                <span>Evaluating Risk...</span>
              </>
            ) : (
              <>
                <span>⚡ Calculate Default Prediction</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* =====================================================================
          5. PREDICTION RESULTS DASHBOARD
         ===================================================================== */}
      {result && (
        <div
          id="prediction-result"
          className={`result-card ${
            result.risk_level === "Low"
              ? "low-risk"
              : result.risk_level === "Moderate"
              ? "moderate-risk"
              : "high-risk"
          }`}
        >
          {/* Result Header */}
          <div className="result-header">
            <div>
              <span className="text-muted small text-uppercase fw-bold">
                Prediction Evaluation Report
              </span>
              <h3 className="mb-0 mt-1">
                {result.is_default ? "⚠️ Default Likely (High Risk)" : "✅ No Default Predicted (Low/Moderate Risk)"}
              </h3>
            </div>

            <div
              className={`result-badge ${
                result.risk_level === "Low"
                  ? "badge-approved"
                  : result.risk_level === "Moderate"
                  ? "badge-moderate"
                  : "badge-rejected"
              }`}
            >
              <span>
                {result.risk_level === "Low"
                  ? "🟢 Low Risk Tier"
                  : result.risk_level === "Moderate"
                  ? "🟡 Moderate Risk Tier"
                  : "🔴 High Risk Tier"}
              </span>
            </div>
          </div>

          {/* Probability Progress Meter */}
          <div className="probability-section">
            <div className="probability-labels">
              <span className="text-success">
                🛡️ Safe Repayment: {(result.non_default_probability * 100).toFixed(1)}%
              </span>
              <span className="text-danger">
                ⚠️ Default Risk: {(result.default_probability * 100).toFixed(1)}%
              </span>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill-safe"
                style={{ width: `${result.non_default_probability * 100}%` }}
                title={`Safe Probability: ${(result.non_default_probability * 100).toFixed(1)}%`}
              ></div>
              <div
                className="progress-fill-risk"
                style={{ width: `${result.default_probability * 100}%` }}
                title={`Default Risk: ${(result.default_probability * 100).toFixed(1)}%`}
              ></div>
            </div>
          </div>

          {/* Key Metrics Breakdown */}
          <div className="result-metrics-grid">
            <div className="metric-box">
              <div className="metric-label">Model Outcome</div>
              <div className="metric-value">
                {result.prediction === 0 ? "Class 0 (Pass)" : "Class 1 (Default)"}
              </div>
            </div>

            <div className="metric-box">
              <div className="metric-label">Default Risk Prob.</div>
              <div className="metric-value text-danger">
                {(result.default_probability * 100).toFixed(1)}%
              </div>
            </div>

            <div className="metric-box">
              <div className="metric-label">Safe Probability</div>
              <div className="metric-value text-success">
                {(result.non_default_probability * 100).toFixed(1)}%
              </div>
            </div>

            <div className="metric-box">
              <div className="metric-label">Model Used</div>
              <div className="metric-value" style={{ fontSize: "1rem" }}>
                {result.model_name}
              </div>
            </div>
          </div>

          {/* Analytical Summary / Guidance */}
          <div className="result-summary-box text-start">
            <strong>🤖 AI Decision Insight:</strong>
            <p className="mb-0 mt-1">{result.summary}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default PredictPage;