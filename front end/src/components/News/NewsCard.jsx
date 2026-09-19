import React, { useState } from 'react';
import { Newspaper, Clock, ExternalLink, Filter } from 'lucide-react';
import { MOCK_NEWS } from '../../services/stockData';
import './NewsCard.css';

export default function NewsCard() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Market', 'Economy', 'Technology', 'FII/DII'];

  const filteredNews = selectedCategory === 'All' 
    ? MOCK_NEWS 
    : MOCK_NEWS.filter(n => n.category === selectedCategory);

  return (
    <div className="news-page">
      <div className="news-header-flex">
        <div>
          <h2 className="page-title flex-center gap-2">
            <Newspaper size={24} className="text-green" />
            <span>News & Insights</span>
          </h2>
          <p className="page-subtitle">Real-time market headlines & AI sentiment indicators</p>
        </div>

        {/* Category Pills */}
        <div className="news-category-pills">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* News Cards Grid */}
      <div className="news-grid">
        {filteredNews.map((article) => (
          <div key={article.id} className="glass-card glass-card-interactive news-card">
            <div className="news-image-wrap">
              <img src={article.thumbnail} alt={article.title} className="news-thumbnail" />
              <span className="badge badge-green news-cat-tag">{article.category}</span>
            </div>

            <div className="news-body">
              <div className="news-meta">
                <span className="news-source">{article.source}</span>
                <span className="meta-dot">•</span>
                <span className="news-time flex-center gap-1">
                  <Clock size={12} /> {article.time}
                </span>
              </div>

              <h3 className="news-title">{article.title}</h3>
              <p className="news-summary">{article.summary}</p>

              <button className="read-more-btn">
                <span>Read Full Article</span>
                <ExternalLink size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
