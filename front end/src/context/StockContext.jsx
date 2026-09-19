import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  fetchStockPrediction,
  fetchStockQuote,
  fetchMarketStatus,
  fetchNiftyIndex,
  fetchMarketIndices,
  fetchMarketBreadth,
  fetchLambdaRankRankings,
  fetchTopGainers,
  fetchTopLosers,
  fetchStockHistory,
  fetchModelMetrics,
  getApiBaseUrl,
  setApiBaseUrl as saveApiBaseUrl
} from '../services/api';

const StockContext = createContext(null);

export function StockProvider({ children }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [currentPrediction, setCurrentPrediction] = useState(null);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);
  const [predictionError, setPredictionError] = useState(null);
  const [topPredictions, setTopPredictions] = useState([]);
  const [watchlist, setWatchlist] = useState(['CIPLA', 'RELIANCE', 'HDFCBANK', 'ICICIBANK', 'INFY', 'TCS']);
  const [apiBaseUrl, setApiBaseState] = useState(getApiBaseUrl());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Backend Live Market State
  const [marketStatus, setMarketStatus] = useState(null);
  const [niftyData, setNiftyData] = useState(null);
  const [niftyHistory, setNiftyHistory] = useState([]);
  const [marketIndices, setMarketIndices] = useState([]);
  const [marketBreadth, setMarketBreadth] = useState(null);
  const [gainersData, setGainersData] = useState(null);
  const [losersData, setLosersData] = useState(null);
  const [lambdaRankData, setLambdaRankData] = useState(null);
  const [modelMetrics, setModelMetrics] = useState([]);

  const setApiBaseUrl = (url) => {
    saveApiBaseUrl(url);
    setApiBaseState(url);
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load central market data from backend
  const refreshMarketData = useCallback(async () => {
    try {
      const [status, nifty, indices, breadth, gainersRes, losersRes, lambdaRes, niftyHist, metricsRes] = await Promise.all([
        fetchMarketStatus(),
        fetchNiftyIndex(),
        fetchMarketIndices(),
        fetchMarketBreadth(),
        fetchTopGainers(20),
        fetchTopLosers(20),
        fetchLambdaRankRankings(20),
        fetchStockHistory('^NSEI', '1D'),
        fetchModelMetrics()
      ]);

      if (status) setMarketStatus(status);
      if (nifty) setNiftyData(nifty);
      if (indices && indices.length) setMarketIndices(indices);
      if (breadth) setMarketBreadth(breadth);
      if (gainersRes) setGainersData(gainersRes);
      if (losersRes) setLosersData(losersRes);
      if (lambdaRes) setLambdaRankData(lambdaRes);
      if (metricsRes && Array.isArray(metricsRes) && metricsRes.length > 0) setModelMetrics(metricsRes);
      if (niftyHist && Array.isArray(niftyHist.candles)) {
        setNiftyHistory(niftyHist.candles);
      } else if (Array.isArray(niftyHist)) {
        setNiftyHistory(niftyHist);
      }

      setCurrentPrediction(prev => {
        if (!prev || !prev.symbol) return prev;
        fetchStockQuote(prev.symbol).then(updatedQuote => {
          if (updatedQuote && !updatedQuote.error && updatedQuote.current_price) {
            setCurrentPrediction(current => {
              if (!current || current.symbol !== updatedQuote.symbol) return current;
              return {
                ...current,
                current_price: updatedQuote.current_price,
                market_status: updatedQuote.market_status || status?.market_status || current.market_status
              };
            });
          }
        }).catch(() => {});
        return prev;
      });
    } catch (err) {
      console.error('[QuantEdge Context] Error refreshing market data:', err);
    }
  }, []);

  useEffect(() => {
    refreshMarketData();

    // Auto-poll market data every 15 seconds if market is open
    const interval = setInterval(() => {
      if (marketStatus?.is_live) {
        refreshMarketData();
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [refreshMarketData, marketStatus?.is_live]);

  const handlePredictStock = async (symbol) => {
    if (!symbol) return;
    const targetSymbol = symbol.trim().toUpperCase();
    setSelectedSymbol(targetSymbol);
    setIsLoadingPrediction(true);
    setPredictionError(null);

    try {
      const result = await fetchStockPrediction(targetSymbol);
      if (result.isError) {
        setPredictionError(result.errorMessage || result.error || `Unable to retrieve live market data for ${targetSymbol}.`);
        setCurrentPrediction(null);
      } else {
        setCurrentPrediction(result);
        showToast(`Market prediction fetched for ${targetSymbol}`);
      }
    } catch (err) {
      setPredictionError(`Market data temporarily unavailable for ${targetSymbol}.`);
      setCurrentPrediction(null);
    } finally {
      setIsLoadingPrediction(false);
    }
  };

  const toggleWatchlist = (symbol) => {
    setWatchlist(prev => {
      const exists = prev.includes(symbol);
      let updated;
      if (exists) {
        updated = prev.filter(s => s !== symbol);
        showToast(`Removed ${symbol} from Watchlist`);
      } else {
        updated = [...prev, symbol];
        showToast(`Added ${symbol} to Watchlist`);
      }
      return updated;
    });
  };

  const navigateToPredict = (symbol) => {
    if (symbol) {
      handlePredictStock(symbol);
    }
    setActiveTab('predict');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <StockContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedSymbol,
        setSelectedSymbol,
        currentPrediction,
        isLoadingPrediction,
        predictionError,
        topPredictions,
        watchlist,
        toggleWatchlist,
        handlePredictStock,
        navigateToPredict,
        apiBaseUrl,
        setApiBaseUrl,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        toastMessage,
        showToast,
        marketStatus,
        niftyData,
        niftyHistory,
        marketIndices,
        marketBreadth,
        gainersData,
        losersData,
        lambdaRankData,
        modelMetrics,
        refreshMarketData
      }}
    >
      {children}
    </StockContext.Provider>
  );
}

export function useStock() {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
}
