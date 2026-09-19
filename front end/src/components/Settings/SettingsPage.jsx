import React, { useState } from 'react';
import { Settings, Server, Shield, Save, RefreshCw } from 'lucide-react';
import { useStock } from '../../context/StockContext';
import './SettingsPage.css';

export default function SettingsPage() {
  const { apiBaseUrl, setApiBaseUrl, showToast } = useStock();
  const [urlInput, setUrlInput] = useState(apiBaseUrl);
  const [confidenceThreshold, setConfidenceThreshold] = useState(50);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setApiBaseUrl(urlInput.trim());
    showToast('Backend API endpoint and model settings saved!');
  };

  return (
    <div className="settings-page">
      <div className="glass-card settings-card">
        <div className="settings-header">
          <h2 className="page-title flex-center gap-2">
            <Settings size={24} className="text-green" />
            <span>Application Settings</span>
          </h2>
          <p className="page-subtitle">Configure API endpoint, backend server connection, and AI model parameters</p>
        </div>

        <form onSubmit={handleSaveSettings} className="settings-form">
          {/* Section 1: Backend API Integration */}
          <div className="settings-section">
            <h3 className="section-title flex-center gap-2">
              <Server size={18} className="text-cyan" />
              <span>Backend API Integration</span>
            </h3>

            <div className="form-group">
              <label htmlFor="api-url-input" className="form-label">
                API Base Endpoint URL (POST /api/predict)
              </label>
              <div className="input-with-button">
                <input
                  id="api-url-input"
                  type="text"
                  className="hero-search-input"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="e.g. http://localhost:5001"
                />
              </div>
              <span className="form-help">
                Frontend issues HTTP POST request to <code>{urlInput}/api/predict</code> with payload <code>&#123; "symbol": "RELIANCE" &#125;</code>.
              </span>
            </div>
          </div>

          {/* Section 2: AI Model Parameters */}
          <div className="settings-section">
            <h3 className="section-title flex-center gap-2">
              <Shield size={18} className="text-amber" />
              <span>AI Model Parameters</span>
            </h3>

            <div className="form-group">
              <div className="threshold-label-row">
                <label htmlFor="confidence-slider" className="threshold-title">
                  Minimum Confidence Signal Threshold
                </label>
                <span className="threshold-value-badge font-heading">{confidenceThreshold}%</span>
              </div>
              
              <input
                id="confidence-slider"
                type="range"
                min="50"
                max="80"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(e.target.value)}
                className="range-slider"
              />
              <span className="form-help mt-1">Filter predictions below this model probability score</span>
            </div>
          </div>

          {/* Section 3: Real-Time Market Auto-Refresh */}
          <div className="settings-section">
            <h3 className="section-title flex-center gap-2">
              <RefreshCw size={18} className="text-green" />
              <span>Real-Time Market Auto-Refresh</span>
            </h3>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
                <span>Enable Real-Time Intraday Market Auto-Refresh</span>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
