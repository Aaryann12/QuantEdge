import React from 'react';
import { Building2, Target, TrendingUp, ShieldCheck } from 'lucide-react';
import { MODEL_METRICS } from '../../services/stockData';
import { useStock } from '../../context/StockContext';
import './MetricCard.css';

const ICON_MAP = {
  Building2,
  Target,
  TrendingUp,
  ShieldCheck
};

export default function MetricCard() {
  const { modelMetrics } = useStock();
  const metricsToDisplay = (modelMetrics && modelMetrics.length > 0) ? modelMetrics : MODEL_METRICS;

  return (
    <div className="metrics-grid">
      {metricsToDisplay.map((metric, idx) => {
        const IconComponent = ICON_MAP[metric.icon] || TrendingUp;
        return (
          <div key={idx} className="glass-card glass-card-interactive metric-card">
            <div className="metric-header">
              <span className="metric-title">{metric.title}</span>
              <div 
                className="metric-icon-box"
                style={{ 
                  backgroundColor: metric.bgColor,
                  color: metric.color 
                }}
              >
                <IconComponent size={20} />
              </div>
            </div>

            <div className="metric-body">
              <span className="metric-value" style={{ color: metric.color }}>
                {metric.value}
              </span>
              <span className="metric-subtitle">{metric.subtitle}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
