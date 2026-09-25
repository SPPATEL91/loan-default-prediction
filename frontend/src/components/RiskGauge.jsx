import React, { useEffect, useState } from 'react';

/**
 * RiskGauge.jsx
 * ============
 * SVG Radial Probability Gauge visualization with count-up animation and
 * dynamic semantic risk color highlighting.
 */
function RiskGauge({ probability = 0, riskLevel = "Low" }) {
  const [displayPercent, setDisplayPercent] = useState(0);

  const targetPercent = Math.min(100, Math.max(0, probability * 100));

  // Count up animation effect
  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const startTime = performance.now();

    const animateCount = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = easeProgress * targetPercent;

      setDisplayPercent(currentVal);

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      }
    };

    requestAnimationFrame(animateCount);
  }, [targetPercent]);

  // Stroke color determination
  let strokeColor = "var(--color-success)";
  let glowColor = "rgba(34, 197, 94, 0.3)";
  if (riskLevel === "High") {
    strokeColor = "var(--color-danger)";
    glowColor = "rgba(239, 68, 68, 0.4)";
  } else if (riskLevel === "Moderate") {
    strokeColor = "var(--color-warning)";
    glowColor = "rgba(245, 158, 11, 0.4)";
  }

  // SVG Circle calculations
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (displayPercent / 100) * circumference;

  return (
    <div className="gauge-wrapper">
      <svg className="gauge-svg" viewBox="0 0 200 200">
        <defs>
          <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Background Track */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          className="gauge-bg-path"
        />

        {/* Animated Value Arc */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          className="gauge-meter-path"
          stroke={strokeColor}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          filter="url(#gaugeGlow)"
        />
      </svg>

      {/* Center Percentage Display */}
      <div className="gauge-center-text">
        <div className="gauge-val-percent" style={{ color: strokeColor }}>
          {displayPercent.toFixed(1)}%
        </div>
        <div className="gauge-val-label">Default Probability</div>
      </div>
    </div>
  );
}

export default RiskGauge;
