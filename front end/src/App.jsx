import React from 'react';
import { StockProvider, useStock } from './context/StockContext';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import MobileNavigation from './components/Layout/MobileNavigation';

import HeroCard from './components/Dashboard/HeroCard';
import MetricCard from './components/Dashboard/MetricCard';
import TopPredictionsTable from './components/Dashboard/TopPredictionsTable';
import MarketOverviewCard from './components/Dashboard/MarketOverviewCard';

import StockSearch from './components/Prediction/StockSearch';
import PredictionCard from './components/Prediction/PredictionCard';
import StockChart from './components/Prediction/StockChart';
import KeyInsights from './components/Prediction/KeyInsights';

import WatchlistTable from './components/Watchlist/WatchlistTable';
import TopGainersPage from './components/TopGainers/TopGainersPage';
import TopLosersPage from './components/TopLosers/TopLosersPage';
import MarketOverviewPage from './components/MarketOverview/MarketOverviewPage';
import SettingsPage from './components/Settings/SettingsPage';
import AboutPage from './components/About/AboutPage';

import { Sparkles, AlertCircle } from 'lucide-react';
import './index.css';

function MainContent() {
  const { activeTab, toastMessage, predictionError, currentPrediction } = useStock();

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Header />

        <main className="content-area">
          {predictionError && (
            <div className="toast-notification danger mb-4">
              <AlertCircle size={18} />
              <span>{predictionError}</span>
            </div>
          )}

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="dashboard-view flex-col gap-6">
              <HeroCard />
              <MetricCard />
              <div className="dashboard-grid-2col">
                <TopPredictionsTable />
                <MarketOverviewCard />
              </div>
            </div>
          )}

          {/* PREDICT STOCK TAB */}
          {activeTab === 'predict' && (
            <div className="predict-view flex-col gap-6">
              <StockSearch />
              <PredictionCard />
              {currentPrediction && (
                <div className="prediction-charts-grid">
                  <StockChart />
                  <KeyInsights />
                </div>
              )}
            </div>
          )}

          {/* WATCHLIST TAB */}
          {activeTab === 'watchlist' && <WatchlistTable />}

          {/* DEDICATED TOP GAINERS TAB */}
          {activeTab === 'gainers' && <TopGainersPage />}

          {/* DEDICATED TOP LOSERS TAB */}
          {activeTab === 'losers' && <TopLosersPage />}

          {/* BROAD MARKET OVERVIEW TAB */}
          {activeTab === 'market' && <MarketOverviewPage />}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && <SettingsPage />}

          {/* ABOUT TAB */}
          {activeTab === 'about' && <AboutPage />}
        </main>
      </div>

      {/* Mobile Navigation Bar */}
      <MobileNavigation />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notification">
          <Sparkles size={16} className="text-green" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <StockProvider>
      <MainContent />
    </StockProvider>
  );
}
