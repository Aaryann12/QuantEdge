import React from 'react';
import { 
  LayoutDashboard, 
  Zap, 
  Star, 
  TrendingUp,
  TrendingDown,
  LineChart, 
  Settings, 
  Info,
  X 
} from 'lucide-react';
import { useStock } from '../../context/StockContext';
import './Sidebar.css';

export default function Sidebar() {
  const { 
    activeTab, 
    setActiveTab, 
    isMobileMenuOpen, 
    setIsMobileMenuOpen 
  } = useStock();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'predict', label: 'Predict Stock', icon: Zap, badge: 'AI' },
    { id: 'watchlist', label: 'Watchlist', icon: Star },
    { id: 'gainers', label: 'Top Gainers', icon: TrendingUp },
    { id: 'losers', label: 'Top Losers', icon: TrendingDown },
    { id: 'market', label: 'Market Overview', icon: LineChart },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'about', label: 'About', icon: Info },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Backdrop overlay for mobile drawer */}
      {isMobileMenuOpen && (
        <div 
          className="sidebar-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        {/* Mobile close button */}
        <button 
          className="sidebar-close-btn"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>

        {/* Brand Header */}
        <div className="sidebar-brand" onClick={() => handleNavClick('dashboard')}>
          <div className="brand-logo-icon">
            <TrendingUp size={22} className="logo-chart" />
          </div>
          <div className="brand-text">
            <span className="brand-name">QuantEdge</span>
            <span className="brand-subtitle">AI MARKET INTELLIGENCE</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          <ul>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => handleNavClick(item.id)}
                  >
                    <Icon size={18} className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                    {item.badge && (
                      <span className="nav-badge">{item.badge}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile Section */}
        <div className="sidebar-profile">
          <div className="profile-avatar">A</div>
          <div className="profile-details">
            <span className="profile-name">Aryan</span>
          </div>
        </div>
      </aside>
    </>
  );
}
