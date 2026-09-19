import React, { useState, useEffect } from 'react';
import { Star, Trash2, Zap, AlertCircle } from 'lucide-react';
import { useStock } from '../../context/StockContext';
import { fetchStockQuote } from '../../services/api';
import './WatchlistTable.css';

export default function WatchlistTable() {
  const { watchlist, toggleWatchlist, navigateToPredict, marketStatus } = useStock();
  const [watchlistQuotes, setWatchlistQuotes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const isMarketOpen = marketStatus?.market_status === 'MARKET_OPEN';

  useEffect(() => {
    if (!watchlist || watchlist.length === 0) {
      setWatchlistQuotes([]);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    Promise.all(watchlist.map(sym => fetchStockQuote(sym))).then(results => {
      if (isMounted) {
        const validQuotes = results.filter(q => q && !q.error);
        setWatchlistQuotes(validQuotes);
        setIsLoading(false);
      }
    });

    return () => { isMounted = false; };
  }, [watchlist]);

  return (
    <div className="glass-card watchlist-card">
      <div className="card-header-flex">
        <div>
          <div className="flex-center gap-1 mb-1">
            <Star size={14} fill="#f59e0b" color="#f59e0b" />
            <span className="section-meta-tag">Your Curated Portfolio</span>
          </div>
          <h3 className="card-title">Watchlist ({watchlist.length} Stocks)</h3>
        </div>
      </div>

      {watchlist.length === 0 ? (
        <div className="empty-watchlist">
          <Star size={32} className="text-muted mb-2" />
          <h4>Your Watchlist is Empty</h4>
          <p className="text-muted text-sm">
            Search for stocks and click "Add to Watchlist" to track prices and AI predictions here.
          </p>
        </div>
      ) : (
        <div className="stock-table-container">
          <table className="stock-table watchlist-table-pro">
            <thead>
              <tr>
                <th className="col-stock">STOCK</th>
                <th className="col-price text-right">{isMarketOpen ? 'LIVE PRICE' : 'LAST CLOSE'}</th>
                <th className="col-change text-right">DAILY CHANGE</th>
                <th className="col-session text-center">LAST SESSION</th>
                <th className="col-actions text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {watchlistQuotes.map((stock) => {
                const isUp = (stock.change_percent || 0) >= 0;
                const displayPrice = isMarketOpen ? stock.current_price : (stock.prev_close || stock.current_price);
                return (
                  <tr key={stock.symbol} className="stock-row" onClick={() => navigateToPredict(stock.symbol)}>
                    {/* STOCK: Clean block layout separating Symbol and Company Name */}
                    <td className="col-stock">
                      <div className="stock-symbol-block">
                        <span className="symbol-code-lg">{stock.symbol}</span>
                        <span className="company-subname-muted">{stock.company_name}</span>
                      </div>
                    </td>

                    {/* LIVE PRICE / LAST CLOSE */}
                    <td className="col-price text-right font-mono font-bold">
                      ₹{displayPrice?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* DAILY CHANGE */}
                    <td className="col-change text-right font-mono font-bold">
                      <span className={isUp ? 'text-green' : 'text-red'}>
                        {isUp ? '+' : ''}{stock.change_percent}%
                      </span>
                    </td>

                    {/* LAST SESSION */}
                    <td className="col-session text-center text-muted font-mono text-xs">
                      {stock.formatted_trading_date || stock.last_trading_date}
                    </td>

                    {/* ACTIONS: Compact Predict + Remove Buttons */}
                    <td className="col-actions text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="watchlist-actions-cell">
                        <button
                          className="btn-predict-compact"
                          onClick={() => navigateToPredict(stock.symbol)}
                          title={`Generate AI prediction for ${stock.symbol}`}
                        >
                          <Zap size={13} className="icon-bolt" />
                          <span>Predict</span>
                        </button>

                        <button
                          className="btn-remove-compact"
                          onClick={() => toggleWatchlist(stock.symbol)}
                          title="Remove from Watchlist"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
