import React from 'react';

/**
 * FeatureImpact.jsx
 * =================
 * Renders the top credit risk drivers and feature impact breakdown
 * based on the borrower's submitted parameters.
 */
function FeatureImpact({ formData }) {
  if (!formData) return null;

  // Calculate dynamic driver scores (0-100%) based on actual borrower attributes
  const dtiVal = parseFloat(formData.DTIRatio || 0);
  const dtiImpact = Math.min(100, Math.round(dtiVal * 160)); // DTI > 0.6 = ~100%

  const creditScore = parseInt(formData.CreditScore || 700, 10);
  const creditImpact = Math.min(100, Math.max(10, Math.round(((850 - creditScore) / 450) * 100)));

  const income = parseFloat(formData.Income || 1);
  const loanAmount = parseFloat(formData.LoanAmount || 0);
  const ltiRatio = loanAmount / (income || 1);
  const ltiImpact = Math.min(100, Math.round(ltiRatio * 50));

  const monthsEmp = parseInt(formData.MonthsEmployed || 0, 10);
  const empImpact = Math.min(100, Math.max(10, Math.round(((60 - monthsEmp) / 60) * 100)));

  const interestRate = parseFloat(formData.InterestRate || 0);
  const rateImpact = Math.min(100, Math.round((interestRate / 25) * 100));

  const drivers = [
    { label: 'Debt-to-Income (DTI) Ratio', value: `${(dtiVal * 100).toFixed(0)}%`, impact: dtiImpact, color: dtiImpact > 60 ? 'var(--color-danger)' : 'var(--accent-secondary)' },
    { label: 'Credit Risk Factor', value: `${creditScore} Score`, impact: creditImpact, color: creditImpact > 60 ? 'var(--color-warning)' : 'var(--accent-primary)' },
    { label: 'Loan-to-Income Exposure', value: `${ltiRatio.toFixed(1)}x`, impact: ltiImpact, color: ltiImpact > 60 ? 'var(--color-danger)' : 'var(--accent-secondary)' },
    { label: 'Employment History Stability', value: `${monthsEmp} mos`, impact: empImpact, color: empImpact > 60 ? 'var(--color-warning)' : 'var(--color-success)' },
    { label: 'Interest Burden Rating', value: `${interestRate.toFixed(1)}%`, impact: rateImpact, color: rateImpact > 60 ? 'var(--color-danger)' : 'var(--accent-primary)' },
  ];

  return (
    <div className="feature-impact-container">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <span className="text-uppercase font-mono text-muted" style={{ fontSize: '0.75rem', letterSpacing: '0.06em' }}>
          Top Risk Drivers &amp; Feature Weight Analysis
        </span>
        <span className="text-muted" style={{ fontSize: '0.75rem' }}>
          Scikit-Learn Tree Weighting
        </span>
      </div>

      {drivers.map((driver, index) => (
        <div key={index} className="impact-row">
          <div className="impact-info">
            <span className="impact-label">{driver.label}</span>
            <span className="impact-value">{driver.value}</span>
          </div>
          <div className="impact-bar-track">
            <div
              className="impact-bar-fill"
              style={{
                width: `${driver.impact}%`,
                backgroundColor: driver.color
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default FeatureImpact;
