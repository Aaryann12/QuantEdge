import React, { useState, useEffect } from 'react';
import { Search, Zap, Sparkles, Loader2 } from 'lucide-react';
import { useStock } from '../../context/StockContext';
import { POPULAR_STOCKS } from '../../services/stockData';
import { searchStocksApi } from '../../services/api';
import './HeroCard.css';

export default function HeroCard() {
  const { 
    selectedSymbol, 
    handlePredictStock, 
    isLoadingPrediction,
    navigateToPredict 
  } = useStock();

  const [inputQuery, setInputQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState(null);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const quickStocks = ['CIPLA', 'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN'];

  // Query Backend Search API for 500-Stock Universe
  useEffect(() => {
    const q = inputQuery.trim();
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
          // Fallback client filter across 500 stocks
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
  }, [inputQuery]);

  const onSelectStock = (stock) => {
    setInputQuery(stock.symbol);
    setSelectedStock(stock);
    setShowDropdown(false);
    navigateToPredict(stock.symbol);
  };

  const onSubmitPrediction = (e) => {
    e.preventDefault();
    const sym = selectedStock?.symbol || inputQuery.trim().toUpperCase() || selectedSymbol || 'CIPLA';
    if (sym) {
      navigateToPredict(sym);
      setShowDropdown(false);
    }
  };

  return (
    <div className="glass-card hero-card overflow-visible">
      <div className="hero-content">
        <div className="hero-badge">
          <Sparkles size={14} className="hero-sparkle-icon" />
          <span>LambdaRank 500-Stock Ranking Engine</span>
        </div>

        <h2 className="hero-title">Predict Next Session's Stock Price</h2>
        
        <p className="hero-description">
          AI model analyzes 65 quantitative features across 500 Indian equities to generate instant directional predictions for the next NSE trading session.
        </p>

        {/* Stock Search Form */}
        <form className="hero-search-form" onSubmit={onSubmitPrediction}>
          <div className="search-input-wrapper">
            <Search size={19} className="search-icon" />
            <input
              type="text"
              className="hero-search-input"
              placeholder="Search stock symbol or name (e.g. CIPLA, RELIANCE, TCS, INFY)..."
              value={inputQuery}
              autoComplete="off"
              spellCheck="false"
              autoCorrect="off"
              onChange={(e) => {
                setInputQuery(e.target.value);
                setShowDropdown(true);
                const exactMatch = POPULAR_STOCKS.find(s => s.symbol.toLowerCase() === e.target.value.trim().toLowerCase());
                if (exactMatch) setSelectedStock(exactMatch);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 220)}
            />

            {/* Autocomplete Dropdown - Positioned High Z-Index Above All Cards */}
            {showDropdown && inputQuery.trim() !== '' && (
              <div className="search-dropdown-overlay">
                {filteredStocks.length > 0 ? (
                  filteredStocks.map((stock) => (
                    <div
                      key={stock.symbol}
                      className="dropdown-item-pro"
                      onMouseDown={() => onSelectStock(stock)}
                    >
                      <div className="dropdown-meta">
                        <span className="dropdown-symbol">{stock.symbol}</span>
                        <span className="dropdown-name">{stock.company_name || stock.name}</span>
                      </div>
                      <div className="dropdown-right">
                        <span className="exchange-badge">NSE</span>
                        <span className="dropdown-price">₹{(stock.current_price || stock.price || 1500).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="dropdown-hint">No stock found matching "{inputQuery}"</div>
                )}
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary predict-btn"
            disabled={isLoadingPrediction || (!inputQuery.trim() && !selectedStock)}
          >
            {isLoadingPrediction ? (
              <>
                <Loader2 size={18} className="spin-loader" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Zap size={18} />
                <span>{selectedStock ? `Predict ${selectedStock.symbol}` : 'Predict Now'}</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Select Chips */}
        <div className="quick-stocks-chips">
          <span className="chips-label">Popular 500 Universe:</span>
          {quickStocks.map((symbol) => (
            <button
              key={symbol}
              type="button"
              className={`stock-chip ${selectedSymbol === symbol ? 'active' : ''}`}
              onClick={() => {
                const stock = POPULAR_STOCKS.find(s => s.symbol === symbol) || { symbol };
                onSelectStock(stock);
              }}
            >
              {symbol}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
