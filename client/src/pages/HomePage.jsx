// HomePage.jsx — The landing page / hero section

import { Link } from 'react-router-dom';

const HERO_CATEGORIES = [
  { label: 'Electronics', icon: '💻', color: '#6366f1' },
  { label: 'Sports', icon: '⚽', color: '#10b981' },
  { label: 'Kitchen', icon: '🍳', color: '#f59e0b' },
  { label: 'Home', icon: '🏠', color: '#3b82f6' },
  { label: 'Furniture', icon: '🪑', color: '#8b5cf6' },
  { label: 'Stationery', icon: '✏️', color: '#ec4899' },
];

function HomePage() {
  return (
    <div className="home-page">
      {/* Hero section */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-tag">✨ New arrivals every week</span>
          <h1 className="hero-title">
            Shop Smarter,<br />
            <span className="hero-highlight">Live Better</span>
          </h1>
          <p className="hero-subtitle">
            Discover thousands of curated products across electronics, sports, home décor and more —
            all at unbeatable prices.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-hero-primary">
              Shop Now →
            </Link>
            <Link to="/register" className="btn btn-hero-secondary">
              Create Account
            </Link>
          </div>
        </div>
        <div className="hero-graphic">
          <div className="hero-blob"></div>
          <div className="hero-floating-card card-1">
            <span>📦</span> Free Delivery
          </div>
          <div className="hero-floating-card card-2">
            <span>🔒</span> Secure Checkout
          </div>
          <div className="hero-floating-card card-3">
            <span>⭐</span> Top Rated
          </div>
        </div>
      </section>

      {/* Features strip */}
      <section className="features-strip">
        <div className="feature-item">
          <span className="feature-icon">🚚</span>
          <div>
            <strong>Free Delivery</strong>
            <p>On orders over $50</p>
          </div>
        </div>
        <div className="feature-item">
          <span className="feature-icon">↩️</span>
          <div>
            <strong>Easy Returns</strong>
            <p>30-day return policy</p>
          </div>
        </div>
        <div className="feature-item">
          <span className="feature-icon">🔒</span>
          <div>
            <strong>Secure Payment</strong>
            <p>100% safe transactions</p>
          </div>
        </div>
        <div className="feature-item">
          <span className="feature-icon">💬</span>
          <div>
            <strong>24/7 Support</strong>
            <p>We're always here</p>
          </div>
        </div>
      </section>

      {/* Category grid */}
      <section className="categories-section">
        <h2 className="section-title">Browse by Category</h2>
        <div className="categories-grid">
          {HERO_CATEGORIES.map(cat => (
            <Link
              key={cat.label}
              to={`/products?category=${cat.label}`}
              className="category-card"
              style={{ '--cat-color': cat.color }}
            >
              <span className="category-icon">{cat.icon}</span>
              <span className="category-label">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to start shopping?</h2>
          <p>Join thousands of happy customers today.</p>
          <Link to="/products" className="btn btn-hero-primary">
            Explore Products
          </Link>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
