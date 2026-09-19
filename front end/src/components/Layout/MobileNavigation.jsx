import React from 'react';
import { LayoutDashboard, Zap, Star, LineChart, MoreHorizontal } from 'lucide-react';
import { useStock } from '../../context/StockContext';
import './MobileNavigation.css';

export default function MobileNavigation() {
  const { activeTab, setActiveTab, setIsMobileMenuOpen } = useStock();

  const mobileNavItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'predict', label: 'Predict', icon: Zap },
    { id: 'watchlist', label: 'Watchlist', icon: Star },
    { id: 'market', label: 'Markets', icon: LineChart },
  ];

  return (
    <nav className="mobile-bottom-nav">
      {mobileNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            className={`mobile-nav-btn ${isActive ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(item.id);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </button>
        );
      })}

      <button
        className="mobile-nav-btn"
        onClick={() => setIsMobileMenuOpen(true)}
      >
        <MoreHorizontal size={20} />
        <span>More</span>
      </button>
    </nav>
  );
}
