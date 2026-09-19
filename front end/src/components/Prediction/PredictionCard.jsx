import React from 'react';
import { ArrowUpRight, ArrowDownRight, ArrowRight, Sparkles, Star, RefreshCw, AlertCircle, Calendar } from 'lucide-react';
import { useStock } from '../../context/StockContext';
import { getNextTradingSessionDate } from '../../utils/dateUtils';
import ConfidenceBar from './ConfidenceBar';
import './PredictionCard.css';

export default function PredictionCard() {
  const {
    currentPrediction,
    isLoadingPrediction,
    handlePredictStock,
    watchlist,
    toggleWatchlist,
    marketStatus
  } = useStock();

  if (!currentPrediction) return null;

  const {
    symbol,
    name,
    last_trading_date,
    formatted_trading_date,
    formatted_next_trading_date,
    current_price,
    prev_close,
    predicted_return_percent,
    predicted_price,
    confidence,
    signal,
    isMock
  } = currentPrediction;

  const isMarketOpen = (marketStatus?.market_status === 'MARKET_OPEN') || (currentPrediction?.market_status === 'MARKET_OPEN');
  
  // Reference price: livePrice if market is OPEN, closingPrice (today's final closing price) if market is CLOSED
  const referencePrice = current_price ?? prev_close;

  // The ML model output: Predicted Target (predicted closing price of next trading session)
  // Must NOT be altered based on live price.
  const predictedTarget = predicted_price || parseFloat((referencePrice * (1 + ((predicted_return_percent || 0) / 100))).toFixed(2));

  // Dynamic Expected Return formula: ((predictedTarget - referencePrice) / referencePrice) * 100
  // Keep full precision in raw calculation, round to 2 decimal places for display
  const rawExpectedReturn = referencePrice > 0
    ? ((predictedTarget - referencePrice) / referencePrice) * 100
    : 0;

  const displayReturnPercent = rawExpectedReturn.toFixed(2);

  // Dynamic Expected Direction derived strictly from expectedReturn
  let expectedDirection = 'NEUTRAL';
  if (rawExpectedReturn > 0) {
    expectedDirection = 'UP';
  } else if (rawExpectedReturn < 0) {
    expectedDirection = 'DOWN';
  }

  const isUp = expectedDirection === 'UP';
  const isDown = expectedDirection === 'DOWN';
  const isNeutral = expectedDirection === 'NEUTRAL';

  const isWatchlisted = watchlist.includes(symbol);
  const tradingDateDisplay = formatted_trading_date || last_trading_date || '07 Aug 2026';
  const nextSessionDateDisplay = formatted_next_trading_date || getNextTradingSessionDate(tradingDateDisplay);

  const referenceLabel = isMarketOpen ? 'Live Price' : 'Last Close';

  return (
    <div className="glass-card prediction-result-card pulse-glow">
      {/* Header Row */}
      <div className="prediction-header">
        <div className="stock-title-block">
          <div className="stock-symbol-row">
            <h2 className="stock-symbol">{symbol}</h2>
            <span className="stock-exchange-tag">NSE</span>
            <div className="session-date-badge">
              <Calendar size={13} className="text-cyan" />
              <span>Last Trading Date: {tradingDateDisplay} • Prediction Date: {nextSessionDateDisplay}</span>
            </div>
            {isMock && (
              <span className="badge badge-cyan" title="Demo calculation engine active">
                Demo AI Engine
              </span>
            )}
          </div>
          <span className="stock-name">{name || `${symbol} Ltd.`}</span>
        </div>

        <div className="header-right-actions">
          <button
            className={`btn btn-secondary ${isWatchlisted ? 'active-star' : ''}`}
            onClick={() => toggleWatchlist(symbol)}
          >
            <Star size={16} fill={isWatchlisted ? '#f59e0b' : 'none'} color={isWatchlisted ? '#f59e0b' : 'currentColor'} />
            <span>{isWatchlisted ? 'In Watchlist' : 'Add to Watchlist'}</span>
          </button>

          <button
            className="btn btn-outline-green"
            onClick={() => handlePredictStock(symbol)}
            disabled={isLoadingPrediction}
            title="Re-run AI model"
          >
            <RefreshCw size={16} className={isLoadingPrediction ? 'spin-loader' : ''} />
            <span>Recalculate</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Prominent Expected Return + Price Cards */}
      <div className="prediction-main-grid">
        {/* Prominent Highlighted Return Card */}
        <div className="hero-return-box">
          <span className="return-box-label">
            <Sparkles size={14} className="icon-spark" />
            AI PREDICTION FOR {nextSessionDateDisplay.toUpperCase()}
          </span>

          <div className="return-primary-val font-heading">
            <span className={isUp ? 'text-green' : (isDown ? 'text-red' : 'text-cyan')}>
              {isUp ? '+' : ''}{displayReturnPercent}%
            </span>
            <span className={`direction-arrow ${isUp ? 'up' : (isDown ? 'down' : 'neutral')}`}>
              {isUp && <ArrowUpRight size={38} />}
              {isDown && <ArrowDownRight size={38} />}
              {isNeutral && <ArrowRight size={38} />}
            </span>
          </div>

          <span className="return-sub-label">Expected Return for {nextSessionDateDisplay}</span>
        </div>

        {/* Price & Direction Details Grid */}
        <div className="prediction-details-grid">
          {/* Last Trading Date */}
          <div className="detail-stat-box">
            <span className="detail-label">Last Trading Date</span>
            <span className="detail-val font-heading text-cyan">
              {tradingDateDisplay}
            </span>
            <span className="detail-sub font-mono">Latest completed trading session</span>
          </div>

          {/* Live Price vs Last Close based on Market Status */}
          <div className="detail-stat-box">
            <span className="detail-label">
              {referenceLabel} ({tradingDateDisplay})
            </span>
            <span className="detail-val font-heading">
              ₹{referencePrice?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="detail-sub font-mono">
              {isMarketOpen ? `Live Market Price on ${tradingDateDisplay}` : `Closing Price on ${tradingDateDisplay}`}
            </span>
          </div>

          {/* Predicted Price Target */}
          <div className="detail-stat-box highlight-box">
            <span className="detail-label">Predicted Target ({nextSessionDateDisplay})</span>
            <span className="detail-val font-heading text-green">
              ₹{predictedTarget.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="detail-sub">Prediction Date: {nextSessionDateDisplay}</span>
          </div>

          {/* Expected Direction & Signal */}
          <div className="detail-stat-box">
            <span className="detail-label">Expected Direction</span>
            <div className="direction-badge-large">
              {isUp && (
                <span className="badge badge-green flex-center gap-1 text-md">
                  <ArrowUpRight size={18} /> UP ({signal || 'STRONG'})
                </span>
              )}
              {isDown && (
                <span className="badge badge-red flex-center gap-1 text-md">
                  <ArrowDownRight size={18} /> DOWN ({signal || 'STRONG'})
                </span>
              )}
              {isNeutral && (
                <span className="badge badge-cyan flex-center gap-1 text-md">
                  <ArrowRight size={18} /> NEUTRAL ({signal || 'STRONG'})
                </span>
              )}
            </div>
            <span className="detail-sub">LambdaRANK Feature Signal</span>
          </div>
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="confidence-row-wrap">
        <ConfidenceBar confidence={confidence} signal={signal} />
      </div>

      <div className="disclaimer-footnote">
        <AlertCircle size={14} />
        <span>
          Disclaimer: AI predictions are based on historical closing data from {tradingDateDisplay} for the next trading session ({nextSessionDateDisplay}).
        </span>
      </div>
    </div>
  );
}
