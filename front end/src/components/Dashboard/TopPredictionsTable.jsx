import React from 'react';
import { ArrowUpRight, Sparkles, AlertCircle } from 'lucide-react';
import { useStock } from '../../context/StockContext';
import { getNextTradingSessionDate } from '../../utils/dateUtils';
import './TopPredictionsTable.css';

export default function TopPredictionsTable() {
  const { navigateToPredict, lambdaRankData, marketStatus } = useStock();

  const rankingsData = lambdaRankData;
  const rankingsList = lambdaRankData?.rankings 
    ? lambdaRankData.rankings.slice(0, 8) 
    : [];

  const formattedDate = rankingsData?.formatted_trading_date || marketStatus?.formatted_trading_date || '07 Aug 2026';
  const nextSessionDate = rankingsData?.formatted_next_trading_date || marketStatus?.formatted_next_trading_date || getNextTradingSessionDate(formattedDate);
  const isMarketOpen = (rankingsData?.market_status === 'MARKET_OPEN') || (marketStatus?.market_status === 'MARKET_OPEN');

  return (
    <div className="glass-card top-predictions-card">
      <div className="card-header-flex mb-2">
        <div>
          <div className="flex-center gap-1 mb-1">
            <Sparkles size={14} className="text-green" />
            <span className="section-meta-tag">LambdaRANK Quant Ranking</span>
          </div>
          <h3 className="card-title">Top Quant-Ranked Stocks</h3>
        </div>
        <button className="btn btn-outline-cyan text-xs" onClick={() => navigateToPredict('HAL')}>
          View All
        </button>
      </div>

      <p className="card-subtitle mb-3">
        Based on {formattedDate} {isMarketOpen ? 'live price data' : 'closing data'} • Prediction for {nextSessionDate}
      </p>

      {rankingsData?.error ? (
        <div className="error-message-box">
          <AlertCircle size={18} className="text-amber" />
          <span>Market data temporarily unavailable</span>
        </div>
      ) : rankingsList.length > 0 ? (
        <div className="stock-table-container">
          <table className="stock-table top-predictions-table-pro">
            <thead>
              <tr>
                <th style={{ width: '36px' }}>Rank</th>
                <th>Stock Symbol</th>
                <th className="text-right">{isMarketOpen ? 'LIVE PRICE' : 'LAST CLOSE'}</th>
                <th className="text-right">Return</th>
                <th className="text-center">Signal</th>
                <th className="text-center" style={{ width: '80px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {rankingsList.map((stock, index) => {
                const rankNum = stock.rank || (index + 1);
                const isUp = (stock.change_percent || 0) >= 0;
                const displayPrice = stock.current_price ?? stock.price ?? stock.prev_close;
                const signalLabel = stock.signal || 'STRONG';

                return (
                  <tr
                    key={stock.symbol}
                    className="stock-row"
                    onClick={() => navigateToPredict(stock.symbol)}
                  >
                    <td>
                      <span className={`rank-badge rank-${rankNum}`}>
                        #{rankNum}
                      </span>
                    </td>
                    <td>
                      <div className="stock-symbol-block">
                        <span className="symbol-code-lg">{stock.symbol}</span>
                        <span className="company-subname-muted">{stock.company_name}</span>
                      </div>
                    </td>
                    <td className="text-right font-mono font-bold">
                      ₹{displayPrice?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-right font-mono font-bold">
                      <span className={isUp ? 'text-green' : 'text-red'}>
                        {isUp ? '+' : ''}{stock.change_percent}%
                      </span>
                    </td>
                    <td className="text-center">
                      <span className={`badge ${signalLabel === 'STRONG' ? 'badge-green' : 'badge-cyan'} flex-center gap-1 text-xs`}>
                        <ArrowUpRight size={12} /> {signalLabel}
                      </span>
                    </td>
                    <td className="text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn-predict-compact"
                        onClick={() => navigateToPredict(stock.symbol)}
                        title={`Generate AI prediction for ${stock.symbol}`}
                      >
                        Predict
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-hint">Loading LightGBM LambdaRank rankings...</div>
      )}
    </div>
  );
}
