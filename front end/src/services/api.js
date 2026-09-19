// QuantEdge API Service - Direct Bridge to FastAPI Central Market Data & Prediction Engine
const DEFAULT_BASE_URL = "https://quantedge-d89y.onrender.com";
export function getApiBaseUrl() {
  return localStorage.getItem("quantedge_api_url") || DEFAULT_BASE_URL;
}

export function setApiBaseUrl(url) {
  if (url) {
    localStorage.setItem("quantedge_api_url", url.trim());
  }
}

// 1. Fetch Market Status (Live / Pre-Market / Market Closed / Weekend / Holiday)
export async function fetchMarketStatus() {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/market/status`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.error("[QuantEdge API] Error fetching market status:", err.message);
  }
  return null;
}

// 2. Fetch NIFTY 50 Index Quote
export async function fetchNiftyIndex() {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/market/nifty`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.error("[QuantEdge API] Error fetching NIFTY index:", err.message);
  }
  return null;
}

// 2b. Fetch All Major Indian Market Indices (NIFTY 50, SENSEX, NIFTY BANK, NIFTY IT)
export async function fetchMarketIndices() {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/market/indices`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.error(
      "[QuantEdge API] Error fetching market indices:",
      err.message,
    );
  }
  return [];
}

// 3. Fetch Market Breadth (Advances vs Declines & Volume)
export async function fetchMarketBreadth() {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/market/breadth`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.error(
      "[QuantEdge API] Error fetching market breadth:",
      err.message,
    );
  }
  return null;
}

// 3b. Fetch Real LightGBM LambdaRank Quant Rankings
export async function fetchLambdaRankRankings(limit = 10) {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/market/lambdarank?limit=${limit}`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.error(
      "[QuantEdge API] Error fetching LambdaRank rankings:",
      err.message,
    );
  }
  return null;
}

// 3c. Fetch Authoritative Model Performance Metrics
export async function fetchModelMetrics() {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/market/metrics`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.error("[QuantEdge API] Error fetching model metrics:", err.message);
  }
  return null;
}

// 4. Fetch Top Gainers
export async function fetchTopGainers(limit = 10) {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/market/gainers?limit=${limit}`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.error("[QuantEdge API] Error fetching top gainers:", err.message);
  }
  return [];
}

// 5. Fetch Top Losers
export async function fetchTopLosers(limit = 10) {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/market/losers?limit=${limit}`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.error("[QuantEdge API] Error fetching top losers:", err.message);
  }
  return [];
}

// 6. Search Stocks from 500-Stock Universe
export async function searchStocksApi(query, limit = 8) {
  const baseUrl = getApiBaseUrl();
  if (!query || !query.trim()) return [];
  try {
    const res = await fetch(
      `${baseUrl}/api/stocks/search?q=${encodeURIComponent(query.trim())}&limit=${limit}`,
    );
    if (res.ok) return await res.json();
  } catch (err) {
    console.error("[QuantEdge API] Error searching stocks:", err.message);
  }
  return [];
}

// 7. Fetch Stock Quote
export async function fetchStockQuote(symbol) {
  const baseUrl = getApiBaseUrl();
  if (!symbol) return null;
  try {
    const res = await fetch(
      `${baseUrl}/api/stocks/${encodeURIComponent(symbol.toUpperCase())}/quote`,
    );
    if (res.ok) return await res.json();
  } catch (err) {
    console.error(
      `[QuantEdge API] Error fetching quote for ${symbol}:`,
      err.message,
    );
  }
  return null;
}

// 8. Fetch Historical OHLCV Candles (Skips weekends & holidays)
export async function fetchStockHistory(symbol, timeframe = "1M") {
  const baseUrl = getApiBaseUrl();
  if (!symbol) return [];
  try {
    const res = await fetch(
      `${baseUrl}/api/stocks/${encodeURIComponent(symbol.toUpperCase())}/history?timeframe=${timeframe}`,
    );
    if (res.ok) return await res.json();
  } catch (err) {
    console.error(
      `[QuantEdge API] Error fetching history for ${symbol}:`,
      err.message,
    );
  }
  return [];
}

// 9. Fetch LambdaRank Prediction
export async function fetchStockPrediction(symbol) {
  const baseUrl = getApiBaseUrl();
  const cleanSymbol = symbol ? symbol.trim().toUpperCase() : "CIPLA";

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${baseUrl}/api/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ symbol: cleanSymbol }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return {
        ...data,
        isError: false,
      };
    }
  } catch (error) {
    console.error(
      `[QuantEdge API] Prediction failed for ${cleanSymbol}:`,
      error.message,
    );
  }

  // Pure error state - ZERO hardcoded/fake fallback values
  return {
    symbol: cleanSymbol,
    company_name: `${cleanSymbol} Limited`,
    isError: true,
    errorMessage: `Unable to retrieve live market data for ${cleanSymbol} from backend endpoint ${baseUrl}.`,
  };
}
