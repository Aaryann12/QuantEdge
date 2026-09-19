import React, { useState, useEffect } from 'react';
import { LineChart, CandlestickChart } from 'lucide-react';
import { fetchStockHistory } from '../../services/api';
import { useStock } from '../../context/StockContext';
import './StockChart.css';

export default function StockChart() {
  const { selectedSymbol, currentPrediction, marketStatus } = useStock();
  const [timeframe, setTimeframe] = useState('1M');
  const [chartType, setChartType] = useState('line');
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [headerTitle, setHeaderTitle] = useState('');
  const [sessionDate, setSessionDate] = useState('');

  const symbol = currentPrediction?.symbol || selectedSymbol || 'CIPLA';
  const latestTradingDate = currentPrediction?.formatted_trading_date || marketStatus?.formatted_trading_date || '07 Aug 2026';

  // Query Backend Historical OHLCV Candles API for exact timeframe range
  useEffect(() => {
    if (!symbol) return;
    let isMounted = true;

    fetchStockHistory(symbol, timeframe).then(res => {
      if (!isMounted) return;
      if (res && res.candles && Array.isArray(res.candles)) {
        setChartData(res.candles);
        setHeaderTitle(res.header_title || '');
        setSessionDate(res.session_date || '');
      } else if (Array.isArray(res)) {
        setChartData(res);
        setHeaderTitle('');
        setSessionDate('');
      } else {
        setChartData([]);
      }
    });

    return () => { isMounted = false; };
  }, [symbol, timeframe]);

  const priceMin = chartData.length > 0 ? Math.min(...chartData.map(d => d.low || d.price || d.close)) : 1000;
  const priceMax = chartData.length > 0 ? Math.max(...chartData.map(d => d.high || d.price || d.close)) : 1600;
  const range = priceMax - priceMin || 1;

  const svgWidth = 700;
  const svgHeight = 260;
  const padding = { top: 20, right: 30, bottom: 35, left: 55 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  const points = chartData.map((d, index) => {
    const x = padding.left + (index / Math.max(1, chartData.length - 1)) * graphWidth;
    const y = padding.top + graphHeight - (((d.price || d.close) - priceMin) / range) * graphHeight;
    return { x, y, ...d };
  });

  const linePath = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${padding.top + graphHeight} L ${points[0].x} ${padding.top + graphHeight} Z`
    : '';

  const activePoint = hoveredPoint || (points.length > 0 ? points[points.length - 1] : null);

  const defaultTitles = {
    '1D': `Historical intraday prices for ${sessionDate || latestTradingDate}`,
    '5D': 'Historical closing prices for the last 5 trading sessions',
    '1M': 'Historical closing prices for the last 1 month',
    '3M': 'Historical closing prices for the last 3 months',
    '6M': 'Historical closing prices for the last 6 months',
    '1Y': 'Historical closing prices for the last 1 year'
  };

  const dynamicSubheading = headerTitle || defaultTitles[timeframe] || 'Historical prices for the selected period';

  return (
    <div className="glass-card stock-chart-card">
      <div className="chart-header">
        <div className="chart-title-block">
          <div className="chart-icon-wrap">
            <LineChart size={18} className="icon-chart" />
          </div>
          <div>
            <h3 className="chart-heading">{symbol} Price Trend</h3>
            <span className="chart-sub-heading">{dynamicSubheading}</span>
          </div>
        </div>

        {/* Chart Controls */}
        <div className="chart-controls-wrap">
          <div className="chart-type-toggle">
            <button
              className={`type-btn ${chartType === 'line' ? 'active' : ''}`}
              onClick={() => setChartType('line')}
              title="Line Chart"
            >
              <LineChart size={15} />
            </button>
            <button
              className={`type-btn ${chartType === 'candlestick' ? 'active' : ''}`}
              onClick={() => setChartType('candlestick')}
              title="Candlestick Chart"
            >
              <CandlestickChart size={15} />
            </button>
          </div>

          <div className="timeframe-group">
            {['1D', '5D', '1M', '3M', '6M', '1Y'].map((tf) => (
              <button
                key={tf}
                className={`tf-btn ${timeframe === tf ? 'active' : ''}`}
                onClick={() => setTimeframe(tf)}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hover Info Tooltip Header */}
      {activePoint && (
        <div className="chart-live-stats">
          <div className="stat-pill">
            <span className="stat-label">{timeframe === '1D' ? 'Intraday Time:' : 'Trading Session:'}</span>
            <span className="stat-value">{activePoint.timestamp || activePoint.date}</span>
          </div>
          <div className="stat-pill">
            <span className="stat-label">{timeframe === '1D' ? 'Price:' : 'Close Price:'}</span>
            <span className="stat-value font-green">₹{(activePoint.price || activePoint.close)?.toFixed(2)}</span>
          </div>
          {chartType === 'candlestick' && (
            <>
              <div className="stat-pill">
                <span className="stat-label">Open:</span>
                <span className="stat-value">₹{activePoint.open?.toFixed(2)}</span>
              </div>
              <div className="stat-pill">
                <span className="stat-label">High:</span>
                <span className="stat-value">₹{activePoint.high?.toFixed(2)}</span>
              </div>
              <div className="stat-pill">
                <span className="stat-label">Low:</span>
                <span className="stat-value">₹{activePoint.low?.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Interactive SVG Chart */}
      <div className="svg-container">
        {chartData.length > 0 ? (
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="chart-svg"
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const y = padding.top + graphHeight * ratio;
              const priceVal = priceMax - ratio * range;
              return (
                <g key={idx}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={svgWidth - padding.right}
                    y2={y}
                    stroke="rgba(255, 255, 255, 0.06)"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 4}
                    fill="#64748b"
                    fontSize="10"
                    textAnchor="end"
                  >
                    ₹{Math.round(priceVal)}
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            {chartType === 'line' && (
              <path d={areaPath} fill="url(#chartGradient)" />
            )}

            {/* Line Path */}
            {chartType === 'line' && (
              <path
                d={linePath}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Candlesticks */}
            {chartType === 'candlestick' && points.map((p, idx) => {
              const candleWidth = Math.max(3, graphWidth / points.length - 4);
              const isBullish = p.close >= p.open;
              const candleColor = isBullish ? '#10b981' : '#ef4444';
              
              const highY = padding.top + graphHeight - (((p.high || p.close) - priceMin) / range) * graphHeight;
              const lowY = padding.top + graphHeight - (((p.low || p.close) - priceMin) / range) * graphHeight;
              const openY = padding.top + graphHeight - (((p.open || p.close) - priceMin) / range) * graphHeight;
              const closeY = padding.top + graphHeight - (((p.close || p.price) - priceMin) / range) * graphHeight;

              const bodyTop = Math.min(openY, closeY);
              const bodyHeight = Math.max(2, Math.abs(openY - closeY));

              return (
                <g key={idx} onMouseEnter={() => setHoveredPoint(p)}>
                  <line
                    x1={p.x}
                    y1={highY}
                    x2={p.x}
                    y2={lowY}
                    stroke={candleColor}
                    strokeWidth="1.5"
                  />
                  <rect
                    x={p.x - candleWidth / 2}
                    y={bodyTop}
                    width={candleWidth}
                    height={bodyHeight}
                    fill={candleColor}
                    rx="1"
                  />
                </g>
              );
            })}

            {/* Line points */}
            {chartType === 'line' && points.map((p, idx) => (
              <circle
                key={idx}
                cx={p.x}
                cy={p.y}
                r="12"
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredPoint(p)}
              />
            ))}

            {/* Hover Crosshair */}
            {hoveredPoint && (
              <g>
                <line
                  x1={hoveredPoint.x}
                  y1={padding.top}
                  x2={hoveredPoint.x}
                  y2={padding.top + graphHeight}
                  stroke="rgba(16, 185, 129, 0.5)"
                  strokeDasharray="3 3"
                />
                <line
                  x1={padding.left}
                  y1={hoveredPoint.y}
                  x2={svgWidth - padding.right}
                  y2={hoveredPoint.y}
                  stroke="rgba(16, 185, 129, 0.5)"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={hoveredPoint.x}
                  cy={hoveredPoint.y}
                  r="6"
                  fill="#34d399"
                  stroke="#042f2e"
                  strokeWidth="2"
                />
              </g>
            )}

            {/* X-axis date labels */}
            {points.filter((_, i) => i % Math.ceil(points.length / 6) === 0).map((p, i) => (
              <text
                key={i}
                x={p.x}
                y={svgHeight - 8}
                fill="#64748b"
                fontSize="10"
                textAnchor="middle"
              >
                {p.date}
              </text>
            ))}
          </svg>
        ) : (
          <div className="empty-hint p-8 text-center">
            Historical {timeframe} market data temporarily unavailable
          </div>
        )}
      </div>
    </div>
  );
}
