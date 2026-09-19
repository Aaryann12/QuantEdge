import React from 'react';
import './ConfidenceBar.css';

export default function ConfidenceBar({ confidence = 56, signal = 'STRONG' }) {
  let label = 'Low';
  let badgeColor = 'amber';
  if (confidence >= 55) {
    label = 'Strong';
    badgeColor = 'green';
  } else if (confidence >= 52) {
    label = 'Moderate';
    badgeColor = 'cyan';
  }

  // Tick scale spans 50% to 80%+
  const fillPercent = Math.min(100, Math.max(0, ((confidence - 50) / (80 - 50)) * 100));

  return (
    <div className="confidence-bar-container">
      <div className="confidence-bar-header">
        <span className="confidence-label">Confidence Score</span>
        <div className="confidence-value-wrap">
          <span className="confidence-num">{confidence}%</span>
          <span className={`badge badge-${badgeColor}`}>{signal || label}</span>
        </div>
      </div>

      <div className="confidence-track">
        <div 
          className="confidence-fill"
          style={{ width: `${fillPercent}%` }}
        />
      </div>

      <div className="confidence-ticks">
        <span>50%</span>
        <span>60%</span>
        <span>70%</span>
        <span>80%+</span>
      </div>
    </div>
  );
}
