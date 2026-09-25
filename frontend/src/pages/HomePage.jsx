import React from "react";
import { Link } from "react-router-dom";

/**
 * HomePage.jsx
 * ============
 * High-tech Institutional Overview & Machine Learning Platform Architecture.
 */
function HomePage() {
  const docsUrl = `${import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:8000" : "")}/docs`;

  return (
    <div className="workspace-wrapper">
      {/* 1. HERO SECTION */}
      <section className="landing-hero">
        <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-secondary bg-opacity-20 border border-secondary mb-3">
          <span className="status-dot-active" />
          <span className="font-mono text-uppercase text-secondary" style={{ fontSize: "0.75rem", letterSpacing: "0.08em" }}>
            DECISION TREE CLASSIFIER • MAX DEPTH 8
          </span>
        </div>

        <h1 className="landing-title">
          Institutional Credit Risk <br />
          <span className="text-gradient-purple">Intelligence Platform</span>
        </h1>

        <p className="landing-subtitle">
          Evaluate borrower default risk in real-time with scikit-learn models trained on 255,000+ historical loan applications. Built with FastAPI and an embedded client inference engine.
        </p>

        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <Link to="/predict" className="btn-analyze-primary">
            <span>LAUNCH RISK WORKSPACE</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>

          <a
            href={docsUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline-secondary d-inline-flex align-items-center gap-2 px-4 py-2 text-white border-secondary rounded-3"
            style={{ fontWeight: 600 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            <span>API SPECIFICATION</span>
          </a>
        </div>
      </section>

      {/* 2. PLATFORM METRICS */}
      <section className="landing-metrics-grid">
        <div className="glass-panel metric-card">
          <div className="metric-num text-gradient-cyan">255,000+</div>
          <div className="metric-label">Historical Applications</div>
          <div className="text-muted mt-2" style={{ fontSize: "0.75rem" }}>
            Trained on real-world financial, credit, and employment records.
          </div>
        </div>

        <div className="glass-panel metric-card">
          <div className="metric-num text-gradient-purple">88.2%</div>
          <div className="metric-label">Test Accuracy</div>
          <div className="text-muted mt-2" style={{ fontSize: "0.75rem" }}>
            Transparent rule-based decision tree classification.
          </div>
        </div>

        <div className="glass-panel metric-card">
          <div className="metric-num text-gradient-cyan">&lt; 10ms</div>
          <div className="metric-label">Inference Latency</div>
          <div className="text-muted mt-2" style={{ fontSize: "0.75rem" }}>
            Sub-millisecond prediction runtime on client or server.
          </div>
        </div>

        <div className="glass-panel metric-card">
          <div className="metric-num text-gradient-purple">28</div>
          <div className="metric-label">Encoded Features</div>
          <div className="text-muted mt-2" style={{ fontSize: "0.75rem" }}>
            Automated one-hot &amp; label encoding transformation pipeline.
          </div>
        </div>
      </section>

      {/* 3. ARCHITECTURE SHOWCASE */}
      <section className="glass-panel p-4 p-md-5 my-5">
        <div className="text-center max-w-700 mx-auto mb-5">
          <span className="font-mono text-uppercase text-muted" style={{ fontSize: "0.75rem", letterSpacing: "0.08em" }}>
            SYSTEM ARCHITECTURE
          </span>
          <h2 className="fw-bold mt-1" style={{ fontSize: "1.75rem" }}>How Risk Intelligence Works</h2>
        </div>

        <div className="row g-4">
          <div className="col-md-4">
            <div className="p-4 glass-panel-elevated h-100">
              <div className="font-mono text-gradient-cyan fw-bold mb-2" style={{ fontSize: "1.25rem" }}>01</div>
              <h4 className="fw-bold mb-2">16 Raw Attributes</h4>
              <p className="text-muted small m-0">
                Captures demographic data, annual income, credit score, DTI ratio, employment tenure, and loan parameters.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="p-4 glass-panel-elevated h-100">
              <div className="font-mono text-gradient-purple fw-bold mb-2" style={{ fontSize: "1.25rem" }}>02</div>
              <h4 className="fw-bold mb-2">28-Feature Pipeline</h4>
              <p className="text-muted small m-0">
                Encodes categorical variables (Education, Employment, Marital Status, Loan Purpose) into standardized binary features.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="p-4 glass-panel-elevated h-100">
              <div className="font-mono text-gradient-cyan fw-bold mb-2" style={{ fontSize: "1.25rem" }}>03</div>
              <h4 className="fw-bold mb-2">Risk Classification</h4>
              <p className="text-muted small m-0">
                Evaluates exact probability thresholds to generate Low, Moderate, or High risk classifications with executive summaries.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-5">
          <Link to="/predict" className="btn-analyze-primary">
            <span>ENTER RISK WORKSPACE →</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default HomePage;