/**
 * HomePage.jsx
 * ============
 * Landing page introducing the Loan Default Prediction AI model,
 * presenting key metrics from the data exploration, and guiding users
 * to the prediction evaluation tool.
 *
 * Concepts for learning:
 * - `Link` component from `react-router-dom` enables client-side routing without
 *   refreshing the whole webpage (Single Page Application behavior).
 * - Component-driven architecture splits UI into reusable cards and sections.
 */

import React from "react";
import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="home-container">
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="hero-badge">
          <span>🌲 Trained on Decision Tree Classifier (Max Depth = 8)</span>
        </div>
        <h1 className="hero-title">
          Smart <span className="gradient-text">Loan Default</span> Risk Assessment
        </h1>
        <p className="hero-subtitle">
          Evaluate creditworthiness and predict the likelihood of loan default in real-time
          using machine learning trained on over 255,000 real-world borrower records.
        </p>

        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <Link to="/predict" className="btn btn-predict">
            <span>🚀 Launch Prediction Tool</span>
          </Link>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline-secondary d-inline-flex align-items-center gap-2 px-4 py-2"
          >
            <span>📖 View Backend API</span>
          </a>
        </div>
      </section>

      {/* 2. KEY METRICS & DATASET HIGHLIGHTS */}
      <section className="row g-4 my-4">
        <div className="col-md-4">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h4>255,000+ Records</h4>
            <p className="text-muted">
              Trained on extensive historical loan applications containing diverse financial,
              demographic, and credit backgrounds.
            </p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h4>~88% Accuracy</h4>
            <p className="text-muted">
              Achieves high recognition rate with Scikit-Learn's Decision Tree algorithm,
              providing transparent rule-based risk classification.
            </p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h4>Real-time FastAPI</h4>
            <p className="text-muted">
              Sub-millisecond inference powered by an asynchronous FastAPI backend with
              automated input validation and a scalable model registry.
            </p>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="bg-white p-4 p-md-5 rounded-4 border my-4 shadow-sm">
        <h3 className="mb-4 text-center">How the Evaluation Works</h3>
        <div className="row g-4 text-center">
          <div className="col-md-4">
            <div className="p-3">
              <div className="fs-1 mb-2">1️⃣</div>
              <h5 className="fw-bold">Input Borrower Data</h5>
              <p className="text-muted small">
                Enter demographic, employment, debt ratio, and loan details (or use quick presets).
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-3">
              <div className="fs-1 mb-2">2️⃣</div>
              <h5 className="fw-bold">Preprocess &amp; Encode</h5>
              <p className="text-muted small">
                The FastAPI backend encodes 16 raw fields into the 28 numerical features expected by the Decision Tree.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-3">
              <div className="fs-1 mb-2">3️⃣</div>
              <h5 className="fw-bold">Instant Risk Report</h5>
              <p className="text-muted small">
                Receive binary prediction (Default vs No Default), risk probability percentage, and recommendations.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-4 pt-2">
          <Link to="/predict" className="btn btn-primary px-4 py-2">
            Try It Now &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}

export default HomePage;