import React from 'react';
import { TrendingUp, TrendingDown, Activity, ArrowUpRight, ArrowDownRight, AlertCircle, ArrowRight } from 'lucide-react';
import { useStock } from '../../context/StockContext';
import './MarketOverviewPage.css';

export default function MarketOverviewPage() {
  const { 
    setActiveTab,
    navigateToPredict, 
    niftyData, 
    niftyHistory,
    marketIndices, 
    marketBreadth, 
    marketStatus, 
    gainersData, 
    losersData 
  } = useStock();

  const formattedDate = gainersData?.formatted_trading_date || niftyData?.formatted_trading_date || marketStatus?.formatted_trading_date || '07 Aug 2026';

  // Dynamic SVG Path Calculation from Real NIFTY 50 Intraday Candles
  const svgWidth = 700;
  const svgHeight = 230;
  const padding = { top: 30, right: 35, bottom: 25, left: 35 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  const validCandles = Array.isArray(niftyHistory) ? niftyHistory : [];
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
      const priceVal = (isLast && niftyData?.price) ? niftyData.price : (d.price || d.close);
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

  // Real Market Indices from Backend API
  const indicesList = marketIndices && marketIndices.length > 0 ? marketIndices : [];

  // Compact Exactly 5-Stock Preview for Market Overview
  const gainersPreview = gainersData?.gainers ? gainersData.gainers.slice(0, 5) : [];
  const losersPreview = losersData?.losers ? losersData.losers.slice(0, 5) : [];

  const adv = marketBreadth?.advances || 0;
  const dec = marketBreadth?.declines || 0;
  const unc = marketBreadth?.unchanged || 0;
  const unavail = marketBreadth?.data_unavailable || 0;
  
  const advPct = marketBreadth?.advances_percent ?? 0;
  const decPct = marketBreadth?.declines_percent ?? 0;
  const uncPct = marketBreadth?.unchanged_percent ?? 0;
  const totalVolDisplay = marketBreadth?.formatted_volume || (marketBreadth?.total_volume_cr ? `${marketBreadth.total_volume_cr} Cr` : 'Volume unavailable');

  return (
    <div className="market-overview-page">
      {/* Top 4 Real Market Index Cards (NIFTY 50, SENSEX, NIFTY BANK, NIFTY IT) */}
      <div className="indexes-grid">
        {indicesList.length > 0 ? (
          indicesList.map((idx, i) => {
            const isPositive = idx.isUp !== undefined ? idx.isUp : (idx.change >= 0);
            const priceVal = idx.price || idx.current_price || 0;
            const changeVal = idx.change !== undefined ? idx.change : 0;
            const changePctVal = idx.change_percent !== undefined ? idx.change_percent : 0;

            return (
              <div key={idx.symbol || i} className="glass-card glass-card-interactive index-card">
                <span className="index-name">{idx.symbol}</span>
                <div className="index-price font-heading">
                  ₹{priceVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div className={`index-change ${isPositive ? 'positive' : 'negative'}`}>
                  {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  <span>
                    {isPositive ? '+' : ''}{changeVal} ({isPositive ? '+' : ''}{changePctVal}%)
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="glass-card index-card full-width-span">
            <span className="text-muted">Loading live index data from backend...</span>
          </div>
        )}
      </div>

      {/* Main Market Movement Chart & Breadth */}
      <div className="market-main-grid">
        {/* Large Market Graph */}
        <div className="glass-card market-chart-hero">
          <div className="card-header-flex">
            <div>
              <h3 className="card-title">NIFTY 50 Market Movement</h3>
              <p className="card-subtitle">Intraday trend line & trading session ({formattedDate})</p>
            </div>
            <span className="badge badge-green">
              {marketStatus?.market_status === 'MARKET_OPEN' ? 'Market Open' : `Session ${formattedDate}`}
            </span>
          </div>

          <div className="hero-svg-wrapper">
            <svg viewBox="0 0 700 230" className="market-hero-svg">
              <defs>
                <linearGradient id="marketHeroGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.38" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {points.length > 0 ? (
                <>
                  <path d={areaPath} fill="url(#marketHeroGrad)" />
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx={points[points.length - 1].x}
                    cy={points[points.length - 1].y}
                    r="5"
                    fill="#34d399"
                  />
                </>
              ) : (
                <path
                  d="M 30 170 Q 120 180, 210 120 T 400 100 T 570 60 T 650 50"
                  fill="none"
                  stroke="rgba(16, 185, 129, 0.3)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              )}
            </svg>
          </div>
        </div>

        {/* Market Breadth & Stats */}
        <div className="glass-card market-breadth-card">
          <h3 className="card-title flex-center gap-2">
            <Activity size={18} className="text-green" />
            <span>Market Breadth</span>
          </h3>
          <p className="card-subtitle">500-Stock Universe Advances vs Declines ({formattedDate})</p>

          <div className="breadth-bars">
            <div className="breadth-row">
              <div className="breadth-label">
                <span className="text-green font-bold">Advances ({adv.toLocaleString('en-IN')})</span>
                <span className="text-muted">{advPct}%</span>
              </div>
              <div className="breadth-track">
                <div className="breadth-fill green" style={{ width: `${advPct}%` }} />
              </div>
            </div>

            <div className="breadth-row">
              <div className="breadth-label">
                <span className="text-red font-bold">Declines ({dec.toLocaleString('en-IN')})</span>
                <span className="text-muted">{decPct}%</span>
              </div>
              <div className="breadth-track">
                <div className="breadth-fill red" style={{ width: `${decPct}%` }} />
              </div>
            </div>

            <div className="breadth-row">
              <div className="breadth-label">
                <span className="text-muted font-bold">Unchanged ({unc.toLocaleString('en-IN')})</span>
                <span className="text-muted">{uncPct}%</span>
              </div>
              <div className="breadth-track">
                <div className="breadth-fill gray" style={{ width: `${uncPct}%` }} />
              </div>
            </div>
          </div>

          <div className="volume-stat-box mt-4">
            <span className="stat-label">Total Volume</span>
            <span className="stat-val font-heading">{totalVolDisplay}</span>
            <span className="stat-sublabel text-muted" style={{ fontSize: '0.75rem', display: 'block', marginTop: '2px' }}>Shares Traded</span>
          </div>
        </div>
      </div>

      {/* SYMMETRICAL 5-ROW TOP GAINERS & TOP LOSERS PREVIEW CARDS */}
      <div className="tables-two-col">
        {/* LEFT: Top Gainers Preview (Top 5 Only) */}
        <div className="glass-card card-padding gainer-loser-box">
          <div className="card-header-flex mb-3">
            <h3 className="card-title text-green flex-center gap-2">
              <TrendingUp size={18} />
              <span>Top Gainers</span>
            </h3>
            <button
              className="btn-ghost-sm text-green"
              onClick={() => setActiveTab('gainers')}
              title="View all top market gainers"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {gainersData?.error ? (
            <div className="error-message-box">
              <AlertCircle size={18} className="text-amber" />
              <span>{gainersData.error}</span>
            </div>
          ) : gainersPreview.length > 0 ? (
            <div className="stock-table-container">
              <table className="stock-table gainer-loser-table">
                <thead>
                  <tr>
                    <th style={{ width: '40%' }}>Stock</th>
                    <th className="text-right" style={{ width: '20%' }}>Price</th>
                    <th className="text-right" style={{ width: '20%' }}>Change</th>
                    <th className="text-right" style={{ width: '20%' }}>Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {gainersPreview.map((g) => (
                    <tr key={g.symbol} className="stock-row" onClick={() => navigateToPredict(g.symbol)}>
                      <td style={{ width: '40%' }}>
                        <div className="stock-symbol-block">
                          <span className="symbol-code-lg">{g.symbol}</span>
                          <span className="company-subname-muted">{g.company_name}</span>
                        </div>
                      </td>
                      <td className="text-right font-mono font-bold" style={{ width: '20%' }}>
                        ₹{g.current_price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="text-right font-mono font-bold text-green" style={{ width: '20%' }}>
                        +{g.change_percent}%
                      </td>
                      <td className="text-right text-muted font-mono text-xs" style={{ width: '20%' }}>
                        {g.formatted_volume || `${g.volume}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-hint">Loading live gainers data from backend...</div>
          )}
        </div>

        {/* RIGHT: Top Losers Preview (Top 5 Only) */}
        <div className="glass-card card-padding gainer-loser-box">
          <div className="card-header-flex mb-3">
            <h3 className="card-title text-red flex-center gap-2">
              <TrendingDown size={18} />
              <span>Top Losers</span>
            </h3>
            <button
              className="btn-ghost-sm text-red"
              onClick={() => setActiveTab('losers')}
              title="View all top market losers"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {losersData?.error ? (
            <div className="error-message-box">
              <AlertCircle size={18} className="text-amber" />
              <span>{losersData.error}</span>
            </div>
          ) : losersPreview.length > 0 ? (
            <div className="stock-table-container">
              <table className="stock-table gainer-loser-table">
                <thead>
                  <tr>
                    <th style={{ width: '40%' }}>Stock</th>
                    <th className="text-right" style={{ width: '20%' }}>Price</th>
                    <th className="text-right" style={{ width: '20%' }}>Change</th>
                    <th className="text-right" style={{ width: '20%' }}>Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {losersPreview.map((l) => (
                    <tr key={l.symbol} className="stock-row" onClick={() => navigateToPredict(l.symbol)}>
                      <td style={{ width: '40%' }}>
                        <div className="stock-symbol-block">
                          <span className="symbol-code-lg">{l.symbol}</span>
                          <span className="company-subname-muted">{l.company_name}</span>
                        </div>
                      </td>
                      <td className="text-right font-mono font-bold" style={{ width: '20%' }}>
                        ₹{l.current_price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="text-right font-mono font-bold text-red" style={{ width: '20%' }}>
                        {l.change_percent}%
                      </td>
                      <td className="text-right text-muted font-mono text-xs" style={{ width: '20%' }}>
                        {l.formatted_volume || `${l.volume}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-hint">Loading live losers data from backend...</div>
          )}
        </div>
      </div>
    </div>
  );
}
