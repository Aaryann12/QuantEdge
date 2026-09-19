import React, { useState, useEffect } from 'react';
import { Search, Zap } from 'lucide-react';
import { useStock } from '../../context/StockContext';
import { POPULAR_STOCKS } from '../../services/stockData';
import { searchStocksApi } from '../../services/api';
import './StockSearch.css';

export default function StockSearch() {
  const { selectedSymbol, handlePredictStock, isLoadingPrediction } = useStock();
  const [query, setQuery] = useState(selectedSymbol || '');
  const [selectedStockObj, setSelectedStockObj] = useState(null);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setFilteredStocks([]);
      return;
    }

    let isMounted = true;
    searchStocksApi(q, 8).then(results => {
      if (isMounted) {
        if (results && results.length > 0) {
          setFilteredStocks(results);
        } else {
          const localFiltered = POPULAR_STOCKS.filter(s => 
            s.symbol.toLowerCase().includes(q.toLowerCase()) ||
            s.name.toLowerCase().includes(q.toLowerCase())
          ).sort((a, b) => {
            const aSym = a.symbol.toLowerCase();
            const bSym = b.symbol.toLowerCase();
            if (aSym === q.toLowerCase()) return -1;
            if (bSym === q.toLowerCase()) return 1;
            if (aSym.startsWith(q.toLowerCase()) && !bSym.startsWith(q.toLowerCase())) return -1;
            if (!aSym.startsWith(q.toLowerCase()) && bSym.startsWith(q.toLowerCase())) return 1;
            return 0;
          }).slice(0, 8);
          setFilteredStocks(localFiltered);
        }
      }
    });

    return () => { isMounted = false; };
  }, [query]);

  const handleSelect = (stock) => {
    setQuery(stock.symbol);
    setSelectedStockObj(stock);
    setIsOpen(false);
    handlePredictStock(stock.symbol);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const sym = selectedStockObj?.symbol || query.trim().toUpperCase();
    if (sym) {
      handlePredictStock(sym);
      setIsOpen(false);
    }
  };

  return (
    <div className="glass-card stock-search-card overflow-visible">
      <form onSubmit={handleSearchSubmit} className="search-bar-wrap">
        <div className="input-relative">
          <Search size={18} className="search-icon-inside" />
          <input
            type="text"
            className="search-input-main"
            placeholder="Search stock symbol or company name (e.g. CIPLA, RELIANCE, TCS, INFY, HDFCBANK)..."
            value={query}
            autoComplete="off"
            spellCheck="false"
            autoCorrect="off"
            onChange={(e) => {
              const val = e.target.value;
              setQuery(val);
              setIsOpen(true);
              const match = POPULAR_STOCKS.find(s => s.symbol.toLowerCase() === val.trim().toLowerCase());
              setSelectedStockObj(match || null);
            }}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 220)}
          />

          {isOpen && query.trim() !== '' && (
            <div className="search-dropdown-overlay">
              {filteredStocks.length > 0 ? (
                filteredStocks.map(s => (
                  <div
                    key={s.symbol}
                    className="dropdown-item-pro"
                    onMouseDown={() => handleSelect(s)}
                  >
                    <div className="dropdown-meta">
                      <span className="dropdown-symbol">{s.symbol}</span>
                      <span className="dropdown-name">{s.company_name || s.name}</span>
                    </div>
                    <div className="dropdown-right">
                      <span className="exchange-badge">NSE</span>
                      <span className="dropdown-price">₹{(s.current_price || s.price || 1472).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="dropdown-hint">No stock found matching "{query}"</div>
              )}
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className="btn btn-primary predict-now-btn" 
          disabled={isLoadingPrediction || (!query.trim() && !selectedStockObj)}
        >
          <Zap size={18} />
          <span>{selectedStockObj ? `Predict ${selectedStockObj.symbol}` : query.trim() ? `Predict ${query.trim().toUpperCase()}` : 'Predict Now'}</span>
        </button>
      </form>

      {/* Quick stock chips */}
      <div className="chips-row">
        <span className="text-muted font-bold text-xs">Quick Select Universe:</span>
        {['CIPLA', 'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN', 'BHARTIARTL'].map(sym => (
          <button
            key={sym}
            type="button"
            className={`chip-btn ${selectedSymbol === sym ? 'active' : ''}`}
            onClick={() => {
              const stock = POPULAR_STOCKS.find(s => s.symbol === sym) || { symbol: sym };
              handleSelect(stock);
            }}
          >
            {sym}
          </button>
        ))}
      </div>
    </div>
  );
}
