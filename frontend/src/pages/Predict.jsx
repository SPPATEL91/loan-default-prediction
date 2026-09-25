import React, { useState, useEffect } from "react";
import { runClientPrediction } from "../utils/predictor";
import RiskGauge from "../components/RiskGauge";
import FeatureImpact from "../components/FeatureImpact";

// FastAPI backend base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:8000" : "");

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

// Preset Profiles for 1-click risk testing
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
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [activeTab, setActiveTab] = useState("all"); // 'all' or section index '01', '02', '03', '04', '05'
  const [activePreset, setActivePreset] = useState(null);

  // Registered models
  const [models, setModels] = useState([
    { id: "decision_tree", name: "Decision Tree Classifier", description: "Trained on 255k+ records (~88% accuracy)" },
    { id: "logistic_regression", name: "Logistic Regression", description: "Linear decision boundary baseline" }
  ]);
  const [selectedModel, setSelectedModel] = useState("decision_tree");

  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Fetch models from backend if available
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
        console.info("Using embedded model registry.");
      }
    }
    fetchModels();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let parsedValue = value;
    if (type === "number" || type === "range") {
      parsedValue = value === "" ? "" : parseFloat(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
    setActivePreset(null);
  };

  const handleApplyPreset = (presetKey) => {
    if (PRESET_PROFILES[presetKey]) {
      setFormData(PRESET_PROFILES[presetKey]);
      setActivePreset(presetKey);
      setError(null);
      setResult(null);
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM_DATA);
    setActivePreset(null);
    setError(null);
    setResult(null);
  };

  // Prediction submit handler with multi-step sequence
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setLoadingStep(1);

    let dtiVal = parseFloat(formData.DTIRatio);
    if (isNaN(dtiVal)) dtiVal = 0.28;
    if (dtiVal > 1.0) dtiVal = dtiVal / 100.0;
    dtiVal = Math.min(1.0, Math.max(0.0, dtiVal));

    let interestRateVal = parseFloat(formData.InterestRate);
    if (isNaN(interestRateVal)) interestRateVal = 7.5;
    if (interestRateVal > 0 && interestRateVal < 1.0) interestRateVal = interestRateVal * 100.0;

    const payload = {
      Age: parseInt(formData.Age, 10) || 35,
      Income: parseFloat(formData.Income) || 50000,
      LoanAmount: parseFloat(formData.LoanAmount) || 15000,
      CreditScore: parseInt(formData.CreditScore, 10) || 700,
      MonthsEmployed: parseInt(formData.MonthsEmployed, 10) || 24,
      NumCreditLines: parseInt(formData.NumCreditLines, 10) || 3,
      InterestRate: interestRateVal,
      LoanTerm: parseInt(formData.LoanTerm, 10) || 36,
      DTIRatio: dtiVal,
      Education: formData.Education,
      EmploymentType: formData.EmploymentType,
      MaritalStatus: formData.MaritalStatus,
      HasMortgage: formData.HasMortgage,
      HasDependents: formData.HasDependents,
      LoanPurpose: formData.LoanPurpose,
      HasCoSigner: formData.HasCoSigner,
      model_id: selectedModel,
    };

    // Step 2 & Step 3 progress indicators
    const step2Timer = setTimeout(() => setLoadingStep(2), 350);
    const step3Timer = setTimeout(() => setLoadingStep(3), 700);

    try {
      let predictionData = null;

      try {
        const response = await fetch(`${API_BASE_URL}/api/predict`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          predictionData = await response.json();
        }
      } catch (netErr) {
        console.info("Running embedded client predictor...");
      }

      if (!predictionData) {
        predictionData = runClientPrediction(payload, selectedModel);
      }

      setTimeout(() => {
        setResult(predictionData);
        setLoading(false);
        setLoadingStep(0);

        setTimeout(() => {
          const resElement = document.getElementById("prediction-result-report");
          if (resElement) {
            resElement.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
      }, 1050);

    } catch (err) {
      console.error("Prediction error:", err);
      setError("An unexpected error occurred during prediction.");
      setLoading(false);
      setLoadingStep(0);
    } finally {
      clearTimeout(step2Timer);
      clearTimeout(step3Timer);
    }
  };

  // Calculated metrics for live preview
  const ltiRatio = (parseFloat(formData.LoanAmount || 0) / (parseFloat(formData.Income || 1))).toFixed(2);
  const rawDti = parseFloat(formData.DTIRatio || 0);
  const currentDtiPercent = rawDti > 1.0 ? rawDti.toFixed(0) : (rawDti * 100).toFixed(0);

  return (
    <div className="workspace-wrapper">
      {/* 1. HERO PRODUCT IDENTITY */}
      <section className="glass-panel top-hero-panel">
        <div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="status-dot-active" />
            <span className="text-uppercase font-mono text-muted" style={{ fontSize: "0.75rem", letterSpacing: "0.08em" }}>
              AI RISK ENGINE • READY
            </span>
          </div>
          <h1 className="top-hero-title">Credit Risk Intelligence</h1>
          <p className="top-hero-subtitle">
            Evaluate borrower default risk using real-time machine-learning inference trained on over 255,000 historical applications.
          </p>
        </div>

        <div className="d-none d-lg-block text-end">
          <div className="font-mono text-muted" style={{ fontSize: "0.75rem" }}>ENGINE CAPABILITY</div>
          <div className="fw-bold text-gradient-cyan" style={{ fontSize: "1.25rem" }}>28 Encoded Features</div>
          <div className="text-muted" style={{ fontSize: "0.75rem" }}>Sub-10ms Latency</div>
        </div>
      </section>

      {/* 2. MODELS & PRESET TOOLBAR */}
      <div className="glass-panel toolbar-panel">
        {/* Model Selector */}
        <div className="model-select-box">
          <span className="text-uppercase font-mono text-muted" style={{ fontSize: "0.75rem", letterSpacing: "0.06em" }}>
            Model Engine:
          </span>
          <select
            className="input-control select-control font-mono glass-panel-elevated"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            style={{ width: "240px", padding: "6px 36px 6px 12px", fontSize: "0.875rem" }}
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Presets Chips */}
        <div className="presets-box">
          <span className="text-uppercase font-mono text-muted me-2" style={{ fontSize: "0.75rem", letterSpacing: "0.06em" }}>
            Presets:
          </span>
          <button
            type="button"
            className={`btn-preset-chip ${activePreset === 'lowRisk' ? 'active' : ''}`}
            onClick={() => handleApplyPreset('lowRisk')}
          >
            <span style={{ color: 'var(--color-success)' }}>●</span> Low Risk Profile
          </button>
          <button
            type="button"
            className={`btn-preset-chip ${activePreset === 'moderateRisk' ? 'active' : ''}`}
            onClick={() => handleApplyPreset('moderateRisk')}
          >
            <span style={{ color: 'var(--color-warning)' }}>●</span> Moderate Risk
          </button>
          <button
            type="button"
            className={`btn-preset-chip ${activePreset === 'highRisk' ? 'active' : ''}`}
            onClick={() => handleApplyPreset('highRisk')}
          >
            <span style={{ color: 'var(--color-danger)' }}>●</span> High Risk Profile
          </button>

          <button
            type="button"
            className="btn-preset-chip text-muted ms-lg-2"
            onClick={handleReset}
            title="Reset Form"
          >
            ↺ Reset
          </button>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE GRID */}
      <form onSubmit={handleSubmit}>
        <div className="workspace-grid">
          {/* LEFT: WORKSPACE INPUT CARDS */}
          <div className="glass-panel workspace-form-card">
            {/* Section Tab Filters for Desktop/Mobile */}
            <div className="section-nav-tabs">
              <button
                type="button"
                className={`section-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                <span>ALL SECTIONS</span>
              </button>
              <button
                type="button"
                className={`section-tab-btn ${activeTab === '01' ? 'active' : ''}`}
                onClick={() => setActiveTab('01')}
              >
                <span className="font-mono">01</span> BORROWER
              </button>
              <button
                type="button"
                className={`section-tab-btn ${activeTab === '02' ? 'active' : ''}`}
                onClick={() => setActiveTab('02')}
              >
                <span className="font-mono">02</span> FINANCIAL
              </button>
              <button
                type="button"
                className={`section-tab-btn ${activeTab === '03' ? 'active' : ''}`}
                onClick={() => setActiveTab('03')}
              >
                <span className="font-mono">03</span> CREDIT
              </button>
              <button
                type="button"
                className={`section-tab-btn ${activeTab === '04' ? 'active' : ''}`}
                onClick={() => setActiveTab('04')}
              >
                <span className="font-mono">04</span> LOAN DETAILS
              </button>
              <button
                type="button"
                className={`section-tab-btn ${activeTab === '05' ? 'active' : ''}`}
                onClick={() => setActiveTab('05')}
              >
                <span className="font-mono">05</span> EMPLOYMENT
              </button>
            </div>

            {/* SECTION 01: BORROWER PROFILE */}
            {(activeTab === 'all' || activeTab === '01') && (
              <div className="mb-4">
                <div className="section-header">
                  <span className="section-num">01</span>
                  <h3 className="section-title">Borrower Profile</h3>
                </div>

                <div className="fields-grid-2col">
                  {/* Age */}
                  <div className="input-group-custom">
                    <label className="input-label-custom">
                      <span>Age</span>
                      <span className="font-mono text-muted">{formData.Age} yrs</span>
                    </label>
                    <div className="input-field-wrapper">
                      <input
                        type="number"
                        name="Age"
                        min="18"
                        max="100"
                        className="input-control font-mono"
                        value={formData.Age}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Education */}
                  <div className="input-group-custom">
                    <label className="input-label-custom">Education Level</label>
                    <div className="input-field-wrapper">
                      <select
                        name="Education"
                        className="input-control select-control"
                        value={formData.Education}
                        onChange={handleChange}
                        required
                      >
                        <option value="High School">High School</option>
                        <option value="Bachelor's">Bachelor's Degree</option>
                        <option value="Master's">Master's Degree</option>
                        <option value="PhD">PhD</option>
                      </select>
                    </div>
                  </div>

                  {/* Marital Status */}
                  <div className="input-group-custom">
                    <label className="input-label-custom">Marital Status</label>
                    <div className="input-field-wrapper">
                      <select
                        name="MaritalStatus"
                        className="input-control select-control"
                        value={formData.MaritalStatus}
                        onChange={handleChange}
                        required
                      >
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                      </select>
                    </div>
                  </div>

                  {/* Has Dependents */}
                  <div className="input-group-custom">
                    <label className="input-label-custom">Has Dependents</label>
                    <div className="input-field-wrapper">
                      <select
                        name="HasDependents"
                        className="input-control select-control"
                        value={formData.HasDependents}
                        onChange={handleChange}
                        required
                      >
                        <option value="No">No Dependents</option>
                        <option value="Yes">Yes (Has Dependents)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 02: FINANCIAL PROFILE */}
            {(activeTab === 'all' || activeTab === '02') && (
              <div className="mb-4">
                <div className="section-header">
                  <span className="section-num">02</span>
                  <h3 className="section-title">Financial Profile</h3>
                </div>

                <div className="fields-grid-2col">
                  {/* Annual Income */}
                  <div className="input-group-custom">
                    <label className="input-label-custom">
                      <span>Annual Income</span>
                      <span className="font-mono text-muted">${Number(formData.Income).toLocaleString()}</span>
                    </label>
                    <div className="input-field-wrapper">
                      <span className="input-prefix">$</span>
                      <input
                        type="number"
                        name="Income"
                        step="1000"
                        min="5000"
                        className="input-control font-mono"
                        value={formData.Income}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Debt-to-Income (DTI) Ratio */}
                  <div className="input-group-custom">
                    <label className="input-label-custom">
                      <span>Debt-to-Income (DTI)</span>
                      <span className="font-mono text-muted">{currentDtiPercent}%</span>
                    </label>
                    <div className="input-field-wrapper">
                      <input
                        type="number"
                        name="DTIRatio"
                        step="any"
                        min="0"
                        className="input-control font-mono"
                        value={formData.DTIRatio}
                        onChange={handleChange}
                        placeholder="e.g. 0.28 or 28"
                        required
                      />
                      <span className="input-suffix">ratio</span>
                    </div>
                  </div>

                  {/* Has Mortgage */}
                  <div className="input-group-custom">
                    <label className="input-label-custom">Has Existing Mortgage</label>
                    <div className="input-field-wrapper">
                      <select
                        name="HasMortgage"
                        className="input-control select-control"
                        value={formData.HasMortgage}
                        onChange={handleChange}
                        required
                      >
                        <option value="No">No Mortgage</option>
                        <option value="Yes">Yes (Has Mortgage)</option>
                      </select>
                    </div>
                  </div>

                  {/* Has Co-Signer */}
                  <div className="input-group-custom">
                    <label className="input-label-custom">Has Co-Signer</label>
                    <div className="input-field-wrapper">
                      <select
                        name="HasCoSigner"
                        className="input-control select-control"
                        value={formData.HasCoSigner}
                        onChange={handleChange}
                        required
                      >
                        <option value="No">No Co-Signer</option>
                        <option value="Yes">Yes (Has Co-Signer)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 03: CREDIT PROFILE */}
            {(activeTab === 'all' || activeTab === '03') && (
              <div className="mb-4">
                <div className="section-header">
                  <span className="section-num">03</span>
                  <h3 className="section-title">Credit Profile</h3>
                </div>

                <div className="fields-grid-2col">
                  {/* Credit Score */}
                  <div className="input-group-custom">
                    <label className="input-label-custom">
                      <span>Credit Score (FICO)</span>
                      <span className="font-mono text-muted">{formData.CreditScore}</span>
                    </label>
                    <div className="input-field-wrapper">
                      <input
                        type="number"
                        name="CreditScore"
                        min="300"
                        max="850"
                        className="input-control font-mono"
                        value={formData.CreditScore}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Num Credit Lines */}
                  <div className="input-group-custom">
                    <label className="input-label-custom">Open Credit Lines</label>
                    <div className="input-field-wrapper">
                      <input
                        type="number"
                        name="NumCreditLines"
                        min="0"
                        max="30"
                        className="input-control font-mono"
                        value={formData.NumCreditLines}
                        onChange={handleChange}
                        required
                      />
                      <span className="input-suffix">lines</span>
                    </div>
                  </div>

                  {/* Interest Rate */}
                  <div className="input-group-custom">
                    <label className="input-label-custom">
                      <span>Interest Rate</span>
                      <span className="font-mono text-muted">{formData.InterestRate}%</span>
                    </label>
                    <div className="input-field-wrapper">
                      <input
                        type="number"
                        name="InterestRate"
                        step="0.1"
                        min="1"
                        max="35"
                        className="input-control font-mono"
                        value={formData.InterestRate}
                        onChange={handleChange}
                        required
                      />
                      <span className="input-suffix">% APR</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 04: LOAN DETAILS */}
            {(activeTab === 'all' || activeTab === '04') && (
              <div className="mb-4">
                <div className="section-header">
                  <span className="section-num">04</span>
                  <h3 className="section-title">Loan Details</h3>
                </div>

                <div className="fields-grid-2col">
                  {/* Loan Amount */}
                  <div className="input-group-custom">
                    <label className="input-label-custom">
                      <span>Requested Loan Amount</span>
                      <span className="font-mono text-muted">${Number(formData.LoanAmount).toLocaleString()}</span>
                    </label>
                    <div className="input-field-wrapper">
                      <span className="input-prefix">$</span>
                      <input
                        type="number"
                        name="LoanAmount"
                        step="1000"
                        min="1000"
                        className="input-control font-mono"
                        value={formData.LoanAmount}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Loan Term */}
                  <div className="input-group-custom">
                    <label className="input-label-custom">Loan Term (Months)</label>
                    <div className="input-field-wrapper">
                      <select
                        name="LoanTerm"
                        className="input-control select-control font-mono"
                        value={formData.LoanTerm}
                        onChange={handleChange}
                        required
                      >
                        <option value="12">12 Months (1 Year)</option>
                        <option value="24">24 Months (2 Years)</option>
                        <option value="36">36 Months (3 Years)</option>
                        <option value="48">48 Months (4 Years)</option>
                        <option value="60">60 Months (5 Years)</option>
                      </select>
                    </div>
                  </div>

                  {/* Loan Purpose */}
                  <div className="input-group-custom">
                    <label className="input-label-custom">Loan Purpose</label>
                    <div className="input-field-wrapper">
                      <select
                        name="LoanPurpose"
                        className="input-control select-control"
                        value={formData.LoanPurpose}
                        onChange={handleChange}
                        required
                      >
                        <option value="Auto">Auto Financing</option>
                        <option value="Business">Business Expansion</option>
                        <option value="Education">Education</option>
                        <option value="Home">Home Purchase / Mortgage</option>
                        <option value="Other">Other Personal</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 05: EMPLOYMENT */}
            {(activeTab === 'all' || activeTab === '05') && (
              <div className="mb-4">
                <div className="section-header">
                  <span className="section-num">05</span>
                  <h3 className="section-title">Employment &amp; Demographics</h3>
                </div>

                <div className="fields-grid-2col">
                  {/* Employment Type */}
                  <div className="input-group-custom">
                    <label className="input-label-custom">Employment Type</label>
                    <div className="input-field-wrapper">
                      <select
                        name="EmploymentType"
                        className="input-control select-control"
                        value={formData.EmploymentType}
                        onChange={handleChange}
                        required
                      >
                        <option value="Full-time">Full-time Employee</option>
                        <option value="Part-time">Part-time Employee</option>
                        <option value="Self-employed">Self-Employed / Business Owner</option>
                        <option value="Unemployed">Unemployed</option>
                      </select>
                    </div>
                  </div>

                  {/* Months Employed */}
                  <div className="input-group-custom">
                    <label className="input-label-custom">
                      <span>Months Employed</span>
                      <span className="font-mono text-muted">{formData.MonthsEmployed} mos</span>
                    </label>
                    <div className="input-field-wrapper">
                      <input
                        type="number"
                        name="MonthsEmployed"
                        min="0"
                        max="480"
                        className="input-control font-mono"
                        value={formData.MonthsEmployed}
                        onChange={handleChange}
                        required
                      />
                      <span className="input-suffix">months</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ACTION BUTTON */}
            <div className="mt-4 pt-2 d-flex justify-content-end">
              <button
                type="submit"
                className="btn-analyze-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    <span>
                      {loadingStep === 1 && "ANALYZING BORROWER PROFILE..."}
                      {loadingStep === 2 && "VALIDATING FINANCIAL INPUTS..."}
                      {loadingStep === 3 && "RUNNING RISK INFERENCE ENGINE..."}
                    </span>
                  </>
                ) : (
                  <>
                    <span>ANALYZE CREDIT RISK</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT: STICKY LIVE RISK PREVIEW PANEL */}
          <div className="glass-panel panel-live-preview">
            <div className="d-flex align-items-center justify-content-between pb-2 border-bottom border-secondary">
              <span className="text-uppercase font-mono text-muted" style={{ fontSize: "0.75rem", letterSpacing: "0.06em" }}>
                RISK INTELLIGENCE PREVIEW
              </span>
              <span className="badge bg-secondary font-mono" style={{ fontSize: "0.6875rem" }}>LIVE</span>
            </div>

            <div className="preview-stat-card">
              <div className="preview-stat-label">DEBT-TO-INCOME (DTI)</div>
              <div className="preview-stat-val text-gradient-cyan">{currentDtiPercent}%</div>
              <div className="text-muted mt-1" style={{ fontSize: "0.75rem" }}>
                {parseFloat(formData.DTIRatio) > 0.45 ? "High Debt Ratio Warning" : "Acceptable DTI Ratio"}
              </div>
            </div>

            <div className="preview-stat-card">
              <div className="preview-stat-label">LOAN-TO-INCOME EXPOSURE</div>
              <div className="preview-stat-val font-mono">{ltiRatio}x</div>
              <div className="text-muted mt-1" style={{ fontSize: "0.75rem" }}>
                ${Number(formData.LoanAmount).toLocaleString()} Loan / ${Number(formData.Income).toLocaleString()} Income
              </div>
            </div>

            <div className="preview-stat-card">
              <div className="preview-stat-label">TARGET CLASSIFIER</div>
              <div className="fw-bold text-gradient-purple" style={{ fontSize: "0.9375rem" }}>
                {selectedModel === 'logistic_regression' ? 'Logistic Regression' : 'Decision Tree (Depth=8)'}
              </div>
              <div className="text-muted mt-1" style={{ fontSize: "0.75rem" }}>
                Multi-layer feature decision boundary
              </div>
            </div>

            {/* Empty or Active State Hint */}
            {!result && (
              <div className="p-3 text-center border border-dashed rounded-3 bg-secondary bg-opacity-10 text-muted" style={{ fontSize: "0.8125rem" }}>
                Complete the workspace form and click <strong className="text-white">ANALYZE CREDIT RISK</strong> to generate real-time risk intelligence.
              </div>
            )}
          </div>
        </div>
      </form>

      {/* ERROR ALERT */}
      {error && (
        <div className="alert alert-danger mt-4 glass-panel border-danger text-danger">
          <strong>Analysis Error:</strong> {error}
        </div>
      )}

      {/* 4. RESULT EXPERIENCE / ASSESSMENT REPORT */}
      {result && (
        <div id="prediction-result-report" className="glass-panel result-report-card">
          <div className="result-header">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="text-uppercase font-mono text-muted" style={{ fontSize: "0.75rem", letterSpacing: "0.06em" }}>
                  OFFICIAL ASSESSMENT REPORT &bull; ID #{Math.floor(100000 + Math.random() * 900000)}
                </span>
              </div>
              <h2 className="fw-bold m-0" style={{ fontSize: "1.5rem" }}>Credit Risk Evaluation Results</h2>
            </div>

            <div className="d-flex align-items-center gap-3">
              <span className={`badge-risk badge-risk-${result.risk_level.toLowerCase()}`}>
                {result.prediction_label}
              </span>
              <span className="font-mono text-muted" style={{ fontSize: "0.75rem" }}>
                {new Date(result.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>

          <div className="result-grid-metrics">
            {/* SVG Radial Gauge */}
            <RiskGauge
              probability={result.default_probability}
              riskLevel={result.risk_level}
            />

            {/* Metrics Breakdown Grid */}
            <div>
              <div className="row g-3 mb-4">
                <div className="col-6 col-md-3">
                  <div className="preview-stat-card">
                    <div className="preview-stat-label">DEFAULT PROBABILITY</div>
                    <div className="preview-stat-val font-mono" style={{
                      color: result.risk_level === 'High' ? 'var(--color-danger)' : (result.risk_level === 'Moderate' ? 'var(--color-warning)' : 'var(--color-success)')
                    }}>
                      {(result.default_probability * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="col-6 col-md-3">
                  <div className="preview-stat-card">
                    <div className="preview-stat-label">REPAYMENT SCORE</div>
                    <div className="preview-stat-val font-mono text-gradient-cyan">
                      {(result.non_default_probability * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="col-6 col-md-3">
                  <div className="preview-stat-card">
                    <div className="preview-stat-label">MODEL ACCURACY</div>
                    <div className="preview-stat-val font-mono">~88.2%</div>
                  </div>
                </div>

                <div className="col-6 col-md-3">
                  <div className="preview-stat-card">
                    <div className="preview-stat-label">RISK CLASSIFICATION</div>
                    <div className="preview-stat-val font-mono text-uppercase" style={{ fontSize: "1.1rem" }}>
                      {result.risk_level}
                    </div>
                  </div>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="p-3 rounded-3 bg-secondary bg-opacity-20 border border-secondary mb-4">
                <div className="font-mono text-uppercase text-muted mb-1" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>
                  UNDERWRITING EXECUTIVE SUMMARY
                </div>
                <p className="m-0 text-slate-200" style={{ fontSize: "0.9375rem", lineHeight: "1.6" }}>
                  {result.summary}
                </p>
              </div>

              {/* Feature Impact Drivers */}
              <FeatureImpact formData={formData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PredictPage;