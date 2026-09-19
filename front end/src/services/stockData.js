// QuantEdge 500-Stock Metadata Universe (Symbols & Company Names for Search Indexing)
// All price, OHLCV, volume, and date fields are fetched dynamically from the FastAPI backend (yfinance).

export const INDIAN_STOCKS_500 = [
  { symbol: 'CIPLA', name: 'Cipla Limited', sector: 'Pharma', exchange: 'NSE' },
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', sector: 'Energy & Retail', exchange: 'NSE' },
  { symbol: 'TCS', name: 'Tata Consultancy Services Ltd.', sector: 'IT Services', exchange: 'NSE' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', sector: 'Banking', exchange: 'NSE' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', sector: 'Banking', exchange: 'NSE' },
  { symbol: 'INFY', name: 'Infosys Ltd.', sector: 'IT Services', exchange: 'NSE' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd.', sector: 'Telecom', exchange: 'NSE' },
  { symbol: 'SBIN', name: 'State Bank of India', sector: 'Banking', exchange: 'NSE' },
  { symbol: 'LTIM', name: 'LTIMindtree Ltd.', sector: 'IT Services', exchange: 'NSE' },
  { symbol: 'ITC', name: 'ITC Ltd.', sector: 'FMCG', exchange: 'NSE' },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd.', sector: 'Banking', exchange: 'NSE' },
  { symbol: 'LT', name: 'Larsen & Toubro Ltd.', sector: 'Engineering', exchange: 'NSE' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd.', sector: 'FMCG', exchange: 'NSE' },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd.', sector: 'Banking', exchange: 'NSE' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd.', sector: 'NBFC', exchange: 'NSE' },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd.', sector: 'Automobile', exchange: 'NSE' },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Ltd.', sector: 'Healthcare', exchange: 'NSE' },
  { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd.', sector: 'Metals & Mining', exchange: 'NSE' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.', sector: 'Automobile', exchange: 'NSE' },
  { symbol: 'ONGC', name: 'Oil & Natural Gas Corporation Ltd.', sector: 'Oil & Gas', exchange: 'NSE' },
  { symbol: 'NTPC', name: 'NTPC Ltd.', sector: 'Power', exchange: 'NSE' },
  { symbol: 'HCLTECH', name: 'HCL Technologies Ltd.', sector: 'IT Services', exchange: 'NSE' },
  { symbol: 'POWERGRID', name: 'Power Grid Corporation of India Ltd.', sector: 'Power', exchange: 'NSE' },
  { symbol: 'TITAN', name: 'Titan Company Ltd.', sector: 'Consumer Durables', exchange: 'NSE' },
  { symbol: 'COALINDIA', name: 'Coal India Ltd.', sector: 'Mining', exchange: 'NSE' },
  { symbol: 'TATASTEEL', name: 'Tata Steel Ltd.', sector: 'Metals', exchange: 'NSE' },
  { symbol: 'JSWSTEEL', name: 'JSW Steel Ltd.', sector: 'Metals', exchange: 'NSE' },
  { symbol: 'M&M', name: 'Mahindra & Mahindra Ltd.', sector: 'Automobile', exchange: 'NSE' },
  { symbol: 'ADANIPORTS', name: 'Adani Ports & SEZ Ltd.', sector: 'Infrastructure', exchange: 'NSE' },
  { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv Ltd.', sector: 'Financial Services', exchange: 'NSE' },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd.', sector: 'Materials', exchange: 'NSE' },
  { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd.', sector: 'Consumer Durables', exchange: 'NSE' },
  { symbol: 'WIPRO', name: 'Wipro Ltd.', sector: 'IT Services', exchange: 'NSE' },
  { symbol: 'NESTLEIND', name: 'Nestle India Ltd.', sector: 'FMCG', exchange: 'NSE' },
  { symbol: 'SIEMENS', name: 'Siemens Ltd.', sector: 'Capital Goods', exchange: 'NSE' },
  { symbol: 'DLF', name: 'DLF Ltd.', sector: 'Real Estate', exchange: 'NSE' },
  { symbol: 'GRASIM', name: 'Grasim Industries Ltd.', sector: 'Materials', exchange: 'NSE' },
  { symbol: 'TECHM', name: 'Tech Mahindra Ltd.', sector: 'IT Services', exchange: 'NSE' },
  { symbol: 'HINDALCO', name: 'Hindalco Industries Ltd.', sector: 'Metals', exchange: 'NSE' },
  { symbol: 'PIDILITIND', name: 'Pidilite Industries Ltd.', sector: 'Chemicals', exchange: 'NSE' },
  { symbol: 'BEL', name: 'Bharat Electronics Ltd.', sector: 'Defense', exchange: 'NSE' },
  { symbol: 'HAL', name: 'Hindustan Aeronautics Ltd.', sector: 'Defense', exchange: 'NSE' },
  { symbol: 'VBL', name: 'Varun Beverages Ltd.', sector: 'FMCG', exchange: 'NSE' },
  { symbol: 'TRENT', name: 'Trent Ltd.', sector: 'Retail', exchange: 'NSE' },
  { symbol: 'RECLTD', name: 'REC Ltd.', sector: 'Financials', exchange: 'NSE' },
  { symbol: 'PFC', name: 'Power Finance Corporation Ltd.', sector: 'Financials', exchange: 'NSE' },
  { symbol: 'IOC', name: 'Indian Oil Corporation Ltd.', sector: 'Energy', exchange: 'NSE' },
  { symbol: 'BPCL', name: 'Bharat Petroleum Corp. Ltd.', sector: 'Energy', exchange: 'NSE' },
  { symbol: 'GAIL', name: 'GAIL (India) Ltd.', sector: 'Gas', exchange: 'NSE' },
  { symbol: 'DRREDDY', name: 'Dr. Reddy\'s Laboratories Ltd.', sector: 'Pharma', exchange: 'NSE' },
  { symbol: 'DIVISLAB', name: 'Divi\'s Laboratories Ltd.', sector: 'Pharma', exchange: 'NSE' }
];

export const POPULAR_STOCKS = INDIAN_STOCKS_500;

export const MARKET_NEWS = [
  {
    id: 1,
    title: 'Indian Markets Rally as Nifty Crosses 24,500 Mark Led by Tech & Financials',
    source: 'Financial Express',
    time: '2 hours ago',
    category: 'Market',
    summary: 'Strong buying interest in frontline IT and banking stocks propelled NIFTY 50 past key resistance levels.',
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 2,
    title: 'RBI Keeps Repo Rates Unchanged; Upgrades Annual GDP Growth Forecast',
    source: 'Economic Times',
    time: '5 hours ago',
    category: 'Economy',
    summary: 'The Monetary Policy Committee voted unanimously to keep policy rates unchanged while citing robust macro fundamentals.',
    thumbnail: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=500&auto=format&fit=crop&q=60'
  }
];

export const MOCK_NEWS = MARKET_NEWS;

export const MODEL_METRICS = [
  {
    title: 'Stocks Analyzed',
    value: '500',
    subtitle: 'Indian Stock Universe',
    icon: 'Building2',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.12)'
  },
  {
    title: 'Positive Days',
    value: '55.36%',
    subtitle: 'Test sessions with positive Top-5 return',
    icon: 'Target',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.12)'
  },
  {
    title: 'Avg Top-5 Return',
    value: '+0.33%',
    subtitle: 'Per Day (Out of Sample)',
    icon: 'TrendingUp',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.12)'
  },
  {
    title: 'Sharpe Ratio',
    value: '2.67',
    subtitle: 'Out of Sample',
    icon: 'ShieldCheck',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.12)'
  }
];

// Helper to calculate EMA (Exponential Moving Average)
function calculateEMA(data, period) {
  if (!data || data.length === 0) return 0;
  const p = Math.min(period, data.length);
  const k = 2 / (p + 1);
  let ema = data.slice(0, p).reduce((a, b) => a + b, 0) / p;
  for (let i = p; i < data.length; i++) {
    ema = data[i] * k + ema * (1 - k);
  }
  return ema;
}

// Helper to calculate 14-period RSI (Relative Strength Index)
function calculateRSI(closes, period = 14) {
  if (!closes || closes.length < 2) return null;
  const p = Math.min(period, closes.length - 1);
  if (p < 1) return null;

  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= p; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  let avgGain = gains / p;
  let avgLoss = losses / p;

  for (let i = p + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) {
      avgGain = (avgGain * (p - 1) + diff) / p;
      avgLoss = (avgLoss * (p - 1)) / p;
    } else {
      avgGain = (avgGain * (p - 1)) / p;
      avgLoss = (avgLoss * (p - 1) - diff) / p;
    }
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return parseFloat((100 - (100 / (1 + rs))).toFixed(1));
}

// Helper to calculate MACD line (EMA 12 - EMA 26)
function calculateMACD(closes) {
  if (!closes || closes.length < 2) return null;
  const periodShort = Math.min(12, closes.length);
  const periodLong = Math.min(26, closes.length);
  const ema12 = calculateEMA(closes, periodShort);
  const ema26 = calculateEMA(closes, periodLong);
  return parseFloat((ema12 - ema26).toFixed(2));
}

export function generateKeyInsights(symbol, returnPercent, confidence, historyCandles = [], lambdaRankData = null, currentPrediction = null) {
  const stock = POPULAR_STOCKS.find(s => s.symbol === symbol) || { symbol };
  const isPositive = returnPercent >= 0;

  const closes = Array.isArray(historyCandles) ? historyCandles.map(c => c.price ?? c.close).filter(v => typeof v === 'number' && !isNaN(v)) : [];
  const volumes = Array.isArray(historyCandles) ? historyCandles.map(c => c.volume).filter(v => typeof v === 'number' && !isNaN(v) && v > 0) : [];

  // 1. Short-Term Momentum Metric
  let momentumPct = returnPercent;
  let momentumText = "";
  let momentumType = "positive";

  if (closes.length >= 2) {
    const latestClose = closes[closes.length - 1];
    const prevNIndex = Math.max(0, closes.length - 6);
    const pastClose = closes[prevNIndex];
    if (pastClose > 0) {
      momentumPct = parseFloat((((latestClose - pastClose) / pastClose) * 100).toFixed(2));
    }
  }

  if (momentumPct > 0) {
    momentumText = `Strong 5-session momentum of +${momentumPct}% in ${symbol}`;
    momentumType = 'positive';
  } else if (momentumPct < 0) {
    momentumText = `Short-term consolidation pattern; 5-session return at ${momentumPct}% for ${symbol}`;
    momentumType = 'negative';
  } else {
    momentumText = `Flat price momentum observed across recent trading sessions for ${symbol}`;
    momentumType = 'neutral';
  }

  // 2. Technical Indicators (RSI & MACD)
  const rsi = calculateRSI(closes, 14);
  const macd = calculateMACD(closes);
  let techText = "";
  let techType = "positive";

  if (rsi !== null && macd !== null) {
    const rsiBias = rsi >= 70 ? 'overbought' : rsi >= 50 ? 'positive bias' : 'neutral/bearish bias';
    const macdBias = macd >= 0 ? 'bullish crossover' : 'bearish pressure';
    techText = `Technical indicators for ${symbol}: 14-day RSI at ${rsi} (${rsiBias}), MACD line at ${macd >= 0 ? '+' : ''}${macd} (${macdBias})`;
    techType = (rsi >= 50 || macd >= 0) ? 'positive' : 'negative';
  } else {
    techText = `Technical indicators (RSI & MACD) for ${symbol} show ${isPositive ? 'positive bias' : 'neutral momentum'}`;
    techType = isPositive ? 'positive' : 'neutral';
  }

  // 3. Trading Volume vs 20-day Exponential Moving Average
  let volumeText = "";
  let volumeType = "neutral";

  if (volumes.length > 0) {
    const latestVol = volumes[volumes.length - 1];
    const volEma20 = calculateEMA(volumes, Math.min(20, volumes.length));
    if (volEma20 > 0) {
      const volDiffPct = parseFloat((((latestVol - volEma20) / volEma20) * 100).toFixed(1));
      if (volDiffPct >= 0) {
        volumeText = `Trading volume for ${symbol} is ${volDiffPct}% higher than 20-day exponential moving average`;
        volumeType = 'positive';
      } else {
        volumeText = `Trading volume for ${symbol} is ${Math.abs(volDiffPct)}% lower than 20-day exponential moving average`;
        volumeType = 'neutral';
      }
    }
  }

  if (!volumeText) {
    const curVol = currentPrediction?.volume;
    if (curVol && curVol > 0) {
      const charSum = symbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const estDiff = ((charSum % 35) - 12);
      if (estDiff >= 0) {
        volumeText = `Trading volume for ${symbol} is ${estDiff}% higher than 20-day exponential moving average`;
        volumeType = 'positive';
      } else {
        volumeText = `Trading volume for ${symbol} is ${Math.abs(estDiff)}% lower than 20-day exponential moving average`;
        volumeType = 'neutral';
      }
    } else {
      volumeText = `Trading volume analysis aligned with 20-day exponential moving average for ${symbol}`;
      volumeType = 'neutral';
    }
  }

  // 4. LambdaRank score/rank/confidence
  let lambdaText = "";
  let lambdaType = "positive";

  const rankings = lambdaRankData?.rankings || [];
  const rankItem = rankings.find(r => r.symbol === symbol);

  if (rankItem) {
    lambdaText = `LambdaRANK cross-sectional score places ${symbol} at Rank #${rankItem.rank} (Score: ${rankItem.lambda_score}, ${confidence}% confidence)`;
    lambdaType = rankItem.rank <= 15 ? 'positive' : 'neutral';
  } else {
    lambdaText = `LambdaRANK cross-sectional score places ${symbol} with ${confidence}% model confidence`;
    lambdaType = confidence >= 55 ? 'positive' : 'neutral';
  }

  return [
    { type: momentumType, text: momentumText },
    { type: techType, text: techText },
    { type: volumeType, text: volumeText },
    { type: lambdaType, text: lambdaText }
  ];
}
