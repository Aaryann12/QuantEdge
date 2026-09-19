import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, BarChart2, RefreshCw, Activity, Layers } from 'lucide-react';
import { useStock } from '../../context/StockContext';
import { fetchStockHistory } from '../../services/api';
import './MarketOverviewCard.css';

export default function MarketOverviewCard() {
  const { setActiveTab, niftyData, niftyHistory, marketBreadth, marketStatus } = useStock();
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [customHistory, setCustomHistory] = useState(null);

  useEffect(() => {
    if (selectedTimeframe === '1D') {
      setCustomHistory(null);
      return;
    }
    let isMounted = true;
    fetchStockHistory('^NSEI', selectedTimeframe).then(res => {
      if (!isMounted) return;
      if (res && res.candles && Array.isArray(res.candles)) {
        setCustomHistory(res.candles);
      } else if (Array.isArray(res)) {
        setCustomHistory(res);
      } else {
        setCustomHistory([]);
      }
    }).catch(() => {
      if (isMounted) setCustomHistory([]);
    });
    return () => { isMounted = false; };
  }, [selectedTimeframe]);

  const isLive = marketStatus?.is_live || false;
  const isUp = (niftyData?.change || 0) >= 0;

  // Dynamic SVG Path Calculation from Real NIFTY 50 Intraday / Historical Candles
  const svgWidth = 450;
  const svgHeight = 180;
  const padding = { top: 35, right: 45, bottom: 20, left: 25 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  const validCandles = selectedTimeframe === '1D'
    ? (Array.isArray(niftyHistory) ? niftyHistory : [])
    : (Array.isArray(customHistory) ? customHistory : []);
    
  const prices = validCandles.map(c => c.price || c.close).filter(v => typeof v === 'number' && !isNaN(v));

  let linePath = '';
  let areaPath = '';
  let points = [];

  if (prices.length > 0) {
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice || 1;

    points = validCandles.map((d, index) => {
      const isLast = index === validCandles.length - 1;
      const priceVal = (selectedTimeframe === '1D' && isLast && niftyData?.price) ? niftyData.price : (d.price || d.close);
      const x = padding.left + (index / Math.max(1, validCandles.length - 1)) * graphWidth;
      const y = padding.top + graphHeight - (((priceVal - minPrice) / range) * graphHeight);
      return { x, y, price: priceVal, date: d.date || d.timestamp };
    });

    linePath = points.reduce((acc, p, idx) => {
      return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    areaPath = points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${padding.top + graphHeight} L ${points[0].x} ${padding.top + graphHeight} Z`
      : '';
  }

  const price = niftyData?.price 
    ? niftyData.price.toLocaleString('en-IN', { minimumFractionDigits: 2 }) 
    : '---';

  const change = niftyData?.change !== undefined 
    ? (niftyData.change >= 0 ? `+${niftyData.change}` : niftyData.change) 
    : '---';

  const changePct = niftyData?.change_percent !== undefined 
    ? `(${niftyData.change_percent >= 0 ? '+' : ''}${niftyData.change_percent}%)` 
    : '';

  const statusText = isLive 
    ? 'MARKET OPEN' 
    : marketStatus?.market_status === 'WEEKEND' 
    ? 'MARKET CLOSED (WEEKEND)' 
    : 'MARKET CLOSED';

  const formattedDate = niftyData?.formatted_trading_date || marketStatus?.formatted_trading_date || '07 Aug 2026';
  const lastUpdated = niftyData?.last_updated || marketStatus?.last_updated || '15:30:00 IST';

  const adv = marketBreadth?.advances || 0;
  const dec = marketBreadth?.declines || 0;
  const unc = marketBreadth?.unchanged || 0;
  const unavail = marketBreadth?.data_unavailable || 0;

  const vol = marketBreadth?.formatted_volume || (marketBreadth?.total_volume_cr ? `${marketBreadth.total_volume_cr} Cr` : 'Volume unavailable');
  const ratio = marketBreadth?.market_breadth_ratio || '---';

  return (
    <div className="glass-card market-overview-card" onClick={() => setActiveTab('market')}>
      {/* Top Header */}
      <div className="card-header-flex">
        <div>
          <div className="market-index-tag">
            <span className={`live-dot ${isLive ? 'live' : 'closed'}`} />
            <span className={isLive ? 'text-green' : 'text-amber'}>{statusText}</span>
          </div>
          <h3 className="card-title mt-1">NIFTY 50</h3>
        </div>
        <div className="timeframe-pills" onClick={(e) => e.stopPropagation()}>
          {['1D', '1W', '1M', '3M', '1Y'].map((tf) => (
            <span
              key={tf}
              className={`pill ${selectedTimeframe === tf ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTimeframe(tf);
              }}
            >
              {tf}
            </span>
          ))}
        </div>
      </div>

      {/* Main Price & Change */}
      <div className="market-price-row">
        <span className="market-main-price font-heading">₹{price}</span>
        <div className={`market-change-badge ${isUp ? 'positive' : 'negative'}`}>
          {isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          <span>{change} {changePct}</span>
        </div>
      </div>

      {/* Centered Scaled Chart with Generous 40px Top & 55px Right Padding */}
      <div className="market-chart-container">
        <svg viewBox="0 0 450 180" className="market-svg-chart" preserveAspectRatio="none">
          <defs>
            <linearGradient id="marketGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isUp ? "#10b981" : "#ef4444"} stopOpacity="0.32" />
              <stop offset="100%" stopColor={isUp ? "#10b981" : "#ef4444"} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Reference Grid Lines with Top Room */}
          <line x1="20" y1="45" x2="405" y2="45" stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" />
          <line x1="20" y1="85" x2="405" y2="85" stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" />
          <line x1="20" y1="125" x2="405" y2="125" stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" />

          {/* Chart Gradient Fill & Line Path */}
          {points.length > 0 ? (
            <>
              <path d={areaPath} fill="url(#marketGradient)" />
              <path
                d={linePath}
                fill="none"
                stroke={isUp ? "#10b981" : "#ef4444"}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx={points[points.length - 1].x}
                cy={points[points.length - 1].y}
                r="4.5"
                fill={isUp ? "#34d399" : "#f87171"}
              />
            </>
          ) : (
            <path
              d="M 25 125 Q 65 135, 110 98 T 195 82 T 280 92 T 350 58 T 395 45"
              fill="none"
              stroke={isUp ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          )}
        </svg>
      </div>

      <div className="market-time-labels">
        {selectedTimeframe === '1D' ? (
          <>
            <span>9:15 AM</span>
            <span>11:00 AM</span>
            <span>12:30 PM</span>
            <span>2:00 PM</span>
            <span>3:30 PM</span>
          </>
        ) : (
          <>
            <span>{validCandles[0]?.date || validCandles[0]?.timestamp || ''}</span>
            <span>{selectedTimeframe} Trend</span>
            <span>{validCandles[validCandles.length - 1]?.date || validCandles[validCandles.length - 1]?.timestamp || ''}</span>
          </>
        )}
      </div>

      {/* Intraday Key Stats Row */}
      <div className="intraday-stats-row">
        <div className="intraday-stat font-mono">
          <span className="stat-lbl">Open</span>
          <span className="stat-val">{niftyData?.open ? `₹${niftyData.open.toLocaleString('en-IN')}` : '---'}</span>
        </div>
        <div className="intraday-stat font-mono">
          <span className="stat-lbl">High</span>
          <span className="stat-val">{niftyData?.high ? `₹${niftyData.high.toLocaleString('en-IN')}` : '---'}</span>
        </div>
        <div className="intraday-stat font-mono">
          <span className="stat-lbl">Low</span>
          <span className="stat-val">{niftyData?.low ? `₹${niftyData.low.toLocaleString('en-IN')}` : '---'}</span>
        </div>
        <div className="intraday-stat font-mono">
          <span className="stat-lbl">Prev. Close</span>
          <span className="stat-val">{niftyData?.prev_close ? `₹${niftyData.prev_close.toLocaleString('en-IN')}` : '---'}</span>
        </div>
      </div>

      {/* Market Summary Grid Section */}
      <div className="market-summary-section">
        <h4 className="summary-title flex-center gap-1">
          <BarChart2 size={15} className="text-cyan" />
          <span>Market Summary ({formattedDate})</span>
        </h4>

        <div className="summary-grid">
          <div className="summary-card">
            <span className="sum-lbl">Advances</span>
            <span className="sum-val text-green font-heading">{adv.toLocaleString('en-IN')}</span>
          </div>

          <div className="summary-card">
            <span className="sum-lbl">Declines</span>
            <span className="sum-val text-red font-heading">{dec.toLocaleString('en-IN')}</span>
          </div>

          <div className="summary-card">
            <span className="sum-lbl">Unchanged / Unavail</span>
            <span className="sum-val text-muted font-heading">
              {unc} {unavail > 0 ? `(${unavail} N/A)` : ''}
            </span>
          </div>

          <div className="summary-card">
            <span className="sum-lbl">Total Volume</span>
            <span className="sum-val text-cyan font-heading">{vol}</span>
          </div>
        </div>
      </div>

      {/* Additional Market Intel Row */}
      <div className="market-intel-banner">
        <div className="intel-block">
          <Activity size={14} className="text-green" />
          <span>Market Ratio: <strong className="text-primary">{ratio}</strong></span>
        </div>
        <div className="intel-block">
          <Layers size={14} className="text-cyan" />
          <span>Exchange: <strong className="text-primary">NSE India</strong></span>
        </div>
      </div>

      <div className="market-footer-updated">
        <span>Session: {formattedDate} | Updated: {lastUpdated}</span>
        <RefreshCw size={12} className="text-muted" />
      </div>
    </div>
  );
}
