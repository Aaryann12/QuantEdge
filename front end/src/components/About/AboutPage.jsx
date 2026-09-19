import React from 'react';
import { Cpu, Database, ShieldCheck, Zap } from 'lucide-react';
import './AboutPage.css';

export default function AboutPage() {
  return (
    <div className="about-page">
      <div className="glass-card about-hero">
        <div className="about-brand-row">
          <div className="brand-logo-icon large">
            <Zap size={28} className="logo-chart" />
          </div>
          <div>
            <h1 className="about-title">QuantEdge</h1>
            <p className="about-subtitle">AI MARKET INTELLIGENCE PLATFORM</p>
          </div>
        </div>

        <p className="about-desc">
          QuantEdge is a quantitative financial intelligence dashboard powered by a LightGBM LambdaRank cross-sectional ranking model trained on 500 Indian equities and 65 quantitative market features.
        </p>

        <div className="about-stats-row">
          <div className="stat-pill-lg">
            <span className="stat-num text-green">500</span>
            <span className="stat-desc">Stock Universe</span>
          </div>
          <div className="stat-pill-lg">
            <span className="stat-num text-cyan">2.671</span>
            <span className="stat-desc">Sharpe Ratio</span>
          </div>
          <div className="stat-pill-lg">
            <span className="stat-num text-amber">55.36%</span>
            <span className="stat-desc">Positive Days</span>
          </div>
          <div className="stat-pill-lg">
            <span className="stat-num text-green">+0.33%</span>
            <span className="stat-desc">Avg Top-5 Daily Return</span>
          </div>
        </div>
      </div>

      {/* Model Specs Grid */}
      <div className="about-specs-grid">
        <div className="glass-card spec-box">
          <Cpu size={24} className="text-green mb-2" />
          <h3 className="spec-title">LambdaRank Machine Learning</h3>
          <p className="spec-desc">
            Uses pairwise and listwise ranking objectives across the 500-stock universe to identify relative market leaders for next-day execution.
          </p>
        </div>

        <div className="glass-card spec-box">
          <Database size={24} className="text-cyan mb-2" />
          <h3 className="spec-title">65 Quantitative Features</h3>
          <p className="spec-desc">
            Processes 65 technical and statistical signals including momentum oscillators, moving average convergence, volume spikes, and cross-sectional rankings.
          </p>
        </div>

        <div className="glass-card spec-box">
          <ShieldCheck size={24} className="text-amber mb-2" />
          <h3 className="spec-title">Out-of-Sample Performance</h3>
          <p className="spec-desc">
            Rigorous out-of-sample testing delivers +0.3286% daily Top-5 return (vs +0.0324% benchmark) and 41.40% cumulative return.
          </p>
        </div>
      </div>
    </div>
  );
}
