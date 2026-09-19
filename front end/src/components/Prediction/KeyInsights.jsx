import React, { useState, useEffect } from 'react';
import { Lightbulb, CheckCircle2, TrendingUp, BarChart2, Star, ShieldAlert } from 'lucide-react';
import { useStock } from '../../context/StockContext';
import { generateKeyInsights } from '../../services/stockData';
import { fetchStockHistory } from '../../services/api';
import './KeyInsights.css';

export default function KeyInsights() {
  const { currentPrediction, toggleWatchlist, watchlist, showToast, lambdaRankData } = useStock();
  const [historyCandles, setHistoryCandles] = useState([]);

  const symbol = currentPrediction?.symbol;

  useEffect(() => {
    if (!symbol) return;
    let isMounted = true;

    fetchStockHistory(symbol, '1M').then(res => {
      if (!isMounted) return;
      if (res && res.candles && Array.isArray(res.candles)) {
        setHistoryCandles(res.candles);
      } else if (Array.isArray(res)) {
        setHistoryCandles(res);
      } else {
        setHistoryCandles([]);
      }
    }).catch(() => {
      if (isMounted) setHistoryCandles([]);
    });

    return () => { isMounted = false; };
  }, [symbol]);

  if (!currentPrediction) return null;

  const { current_price, prev_close, predicted_price, predicted_return_percent, confidence } = currentPrediction;
  const referencePrice = current_price ?? prev_close;
  const predictedTarget = predicted_price || parseFloat((referencePrice * (1 + ((predicted_return_percent || 0) / 100))).toFixed(2));
  const rawExpectedReturn = referencePrice > 0 ? ((predictedTarget - referencePrice) / referencePrice) * 100 : 0;
  const dynamicReturnPercent = parseFloat(rawExpectedReturn.toFixed(2));

  const isWatchlisted = watchlist.includes(symbol);
  const insights = generateKeyInsights(symbol, dynamicReturnPercent, confidence, historyCandles, lambdaRankData, currentPrediction);

  return (
    <div className="glass-card key-insights-card">
      <div className="card-header-flex">
        <div className="insights-title-group">
          <div className="insights-icon-box">
            <Lightbulb size={20} className="icon-lamp" />
          </div>
          <div>
            <h3 className="card-title">Key Insights</h3>
            <span className="card-subtitle">AI model breakdown & signal rationale</span>
          </div>
        </div>
      </div>

      <ul className="insights-list">
        {insights.map((item, idx) => (
          <li key={idx} className="insight-item">
            <div className={`insight-bullet ${item.type}`}>
              <CheckCircle2 size={16} />
            </div>
            <span className="insight-text">{item.text}</span>
          </li>
        ))}
      </ul>

      <div className="insights-actions-row">
        <button
          className="btn btn-secondary flex-1"
          onClick={() => showToast('Full Technical & Feature Analysis report generated')}
        >
          <BarChart2 size={16} />
          <span>View Full Analysis</span>
        </button>

        <button
          className={`btn ${isWatchlisted ? 'btn-secondary active-star' : 'btn-primary'} flex-1`}
          onClick={() => toggleWatchlist(symbol)}
        >
          <Star size={16} fill={isWatchlisted ? '#f59e0b' : 'currentColor'} />
          <span>{isWatchlisted ? 'In Watchlist' : 'Add to Watchlist'}</span>
        </button>
      </div>
    </div>
  );
}
