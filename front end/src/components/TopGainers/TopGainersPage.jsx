import React from 'react';
import { TrendingUp, Zap, AlertCircle, ArrowUpRight } from 'lucide-react';
import { useStock } from '../../context/StockContext';
import './TopGainersPage.css';

export default function TopGainersPage() {
  const { navigateToPredict, gainersData, marketStatus } = useStock();

  const gainersList = gainersData?.gainers || [];
  const formattedDate = gainersData?.formatted_trading_date || marketStatus?.formatted_trading_date || '07 Aug 2026';
  const isLive = marketStatus?.is_live || false;

  const statusLabel = isLive 
    ? 'MARKET OPEN' 
    : `MARKET CLOSED (Session: ${formattedDate})`;

  return (
    <div className="top-gainers-page">
      {/* Dedicated Page Header */}
      <div className="page-header-flex">
        <div>
          <div className="flex-center gap-1 mb-1">
            <TrendingUp size={16} className="text-green" />
            <span className="section-meta-tag text-green">Market Performers</span>
          </div>
          <h2 className="page-title text-green">Top Gainers</h2>
          <p className="page-subtitle">
            Stocks with the strongest percentage gains in the latest trading session ({formattedDate})
          </p>
        </div>

        <div className="header-status-box">
          <span className={`status-pill ${isLive ? 'live' : 'closed'}`}>
            <span className="dot-pulse" />
            <span>{statusLabel}</span>
          </span>
        </div>
      </div>

      {/* Main Dedicated Top Gainers Ranking Table */}
      <div className="glass-card gainers-main-card">
        {gainersData?.error ? (
          <div className="error-message-box">
            <AlertCircle size={18} className="text-amber" />
            <span>{gainersData.error}</span>
          </div>
        ) : gainersList.length > 0 ? (
          <div className="stock-table-container">
            <table className="stock-table gainers-full-table">
              <thead>
                <tr>
                  <th style={{ width: '45px' }}>#</th>
                  <th style={{ width: '32%' }}>STOCK</th>
                  <th style={{ width: '18%' }}>SECTOR</th>
                  <th className="text-right" style={{ width: '16%' }}>PRICE</th>
                  <th className="text-right" style={{ width: '14%' }}>CHANGE</th>
                  <th className="text-right" style={{ width: '12%' }}>VOLUME</th>
                  <th className="text-center" style={{ width: '80px' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {gainersList.map((stock, index) => {
                  return (
                    <tr
                      key={stock.symbol}
                      className="stock-row"
                      onClick={() => navigateToPredict(stock.symbol)}
                    >
                      <td>
                        <span className={`rank-badge rank-${index + 1}`}>
                          #{index + 1}
                        </span>
                      </td>
                      <td>
                        <div className="stock-symbol-block">
                          <span className="symbol-code-lg">{stock.symbol}</span>
                          <span className="company-subname-muted">{stock.company_name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="sector-tag">{stock.sector || 'Equities'}</span>
                      </td>
                      <td className="text-right font-mono font-bold">
                        ₹{stock.current_price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="text-right font-mono font-bold text-green">
                        <span className="gain-badge flex-center-end gap-1">
                          <ArrowUpRight size={13} />
                          <span>+{stock.change_percent}%</span>
                        </span>
                      </td>
                      <td className="text-right text-muted font-mono text-xs">
                        {stock.formatted_volume || `${stock.volume}`}
                      </td>
                      <td className="text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn-predict-compact"
                          onClick={() => navigateToPredict(stock.symbol)}
                          title={`Generate AI prediction for ${stock.symbol}`}
                        >
                          <Zap size={12} />
                          <span>Predict</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-hint p-6">Loading live top gainers from backend market service...</div>
        )}
      </div>
    </div>
  );
}
