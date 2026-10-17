// Footer.jsx — Modern, comprehensive e-commerce footer
import { useState } from 'react';
import { Link } from 'react-router-dom';

const CURRENT_YEAR = new Date().getFullYear();

function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  function handleSubscribe(e) {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  }

  return (
    <footer className="site-footer">
      <div className="footer-container">
        {/* Brand & mission */}
        <div className="footer-col brand-col">
          <Link to="/" className="footer-logo">
            🛒 <span>ShopSmart</span>
          </Link>
          <p className="footer-desc">
            Your trusted destination for smart shopping. Curated products across tech, home, sports and lifestyle at guaranteed best prices.
          </p>
          <div className="footer-socials">
            <span className="social-badge" title="Twitter / X">𝕏</span>
            <span className="social-badge" title="GitHub">🐙</span>
            <span className="social-badge" title="Instagram">📷</span>
            <span className="social-badge" title="LinkedIn">💼</span>
          </div>
        </div>

        {/* Categories */}
        <div className="footer-col">
          <h4 className="footer-heading">Categories</h4>
          <ul className="footer-links">
            <li><Link to="/products?category=Electronics">Electronics</Link></li>
            <li><Link to="/products?category=Sports">Sports & Fitness</Link></li>
            <li><Link to="/products?category=Kitchen">Kitchen Essentials</Link></li>
            <li><Link to="/products?category=Home">Home & Living</Link></li>
            <li><Link to="/products?category=Furniture">Furniture</Link></li>
            <li><Link to="/products?category=Stationery">Stationery</Link></li>
          </ul>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/products">All Products</Link></li>
            <li><Link to="/cart">My Cart</Link></li>
            <li><Link to="/orders">Order History</Link></li>
            <li><Link to="/profile">My Account</Link></li>
            <li><Link to="/admin">Admin Portal</Link></li>
          </ul>
        </div>

        {/* Newsletter signup */}
        <div className="footer-col newsletter-col">
          <h4 className="footer-heading">Stay in the Loop</h4>
          <p className="footer-desc">
            Subscribe for exclusive discounts, new product drops, and weekly deals.
          </p>
          {subscribed ? (
            <div className="newsletter-success">
              ✨ Thank you for subscribing! Check your inbox soon.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="newsletter-form">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="newsletter-input"
              />
              <button type="submit" className="btn btn-primary-sm newsletter-btn">
                Join
              </button>
            </form>
          )}
          <div className="payment-badges">
            <span className="badge-pill">🔒 SSL 256-Bit</span>
            <span className="badge-pill">💳 Visa / MC</span>
            <span className="badge-pill">⚡ Fast Shipping</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>© {CURRENT_YEAR} ShopSmart Inc. All rights reserved. Built with React, Node.js & MySQL.</p>
          <div className="footer-bottom-links">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
