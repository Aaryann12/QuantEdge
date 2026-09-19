import React from 'react';
import { 
  Bell, 
  Menu, 
  TrendingUp, 
  TrendingDown,
  Settings
} from 'lucide-react';
import { useStock } from '../../context/StockContext';
import './Header.css';

export default function Header() {
  const { 
    setIsMobileMenuOpen, 
    setActiveTab, 
    showToast,
    niftyData,
    marketStatus
  } = useStock();

  const isLive = marketStatus?.is_live || false;
  const isUp = (niftyData?.change || 0) >= 0;
  
  const priceDisplay = niftyData?.price 
    ? niftyData.price.toLocaleString('en-IN', { minimumFractionDigits: 2 }) 
    : niftyData?.current_price 
    ? niftyData.current_price.toLocaleString('en-IN', { minimumFractionDigits: 2 }) 
    : '---';

  const changeVal = niftyData?.change !== undefined 
    ? (niftyData.change >= 0 ? `+${niftyData.change}` : `${niftyData.change}`) 
    : '';

  const changePctDisplay = niftyData?.change_percent !== undefined
    ? `(${isUp ? '+' : ''}${niftyData.change_percent}%)`
    : '';

  const statusLabel = isLive 
    ? 'MARKET OPEN' 
    : `CLOSED (${niftyData?.formatted_trading_date || marketStatus?.formatted_trading_date || 'Session'})`;

  return (
    <header className="app-header">
      <div className="header-left">
        <button 
          className="mobile-hamburger-btn"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <div className="header-title-wrap">
          <h1 className="header-greeting">
            Welcome back, Aryan <span className="wave-hand">👋</span>
          </h1>
          <p className="header-subtitle">
            Your AI-powered guide to smarter stock investments
          </p>
        </div>
      </div>

      <div className="header-right">
        {/* Premium Compact NIFTY 50 Ticker Card - Single Source of Truth */}
        <div className="nifty-pro-ticker-card" onClick={() => setActiveTab('market')} title="View NIFTY 50 details">
          <div className="ticker-top-row">
            <span className="ticker-title-tag">NIFTY 50</span>
            <span className={`ticker-status-badge ${isLive ? 'open' : 'closed'}`}>
              <span className="dot-pulse" />
              <span>{statusLabel}</span>
            </span>
          </div>

          <div className="ticker-main-row">
            <span className="ticker-price font-heading">₹{priceDisplay}</span>
            
            <div className={`ticker-change-pill ${isUp ? 'positive' : 'negative'}`}>
              {isUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              <span>{changeVal} {changePctDisplay}</span>
            </div>

            <svg className="ticker-sparkline-svg" viewBox="0 0 65 22">
              <path 
                d="M0,17 L12,14 L24,18 L36,9 L48,12 L65,3" 
                fill="none" 
                stroke={isUp ? '#10b981' : '#ef4444'} 
                strokeWidth="2.2" 
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Action Controls */}
        <div className="header-actions">
          <button 
            className="icon-btn" 
            title="Notifications"
            onClick={() => showToast('No new market notifications')}
          >
            <Bell size={19} />
            <span className="notification-dot" />
          </button>

          <button 
            className="icon-btn" 
            title="Settings"
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={19} />
          </button>
        </div>
      </div>
    </header>
  );
}
