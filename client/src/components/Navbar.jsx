// Navbar.jsx — The top navigation bar shown on every page
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          🛒 <span>ShopSmart</span>
        </Link>

        {/* Mobile menu toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(prev => !prev)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* Navigation links */}
        <div className={`navbar-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link
            to="/products"
            className={`nav-link ${isActive('/products') ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            Shop Catalogue
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className={`nav-link nav-link-admin ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              🛡️ Admin Portal
            </Link>
          )}

          {user ? (
            <>
              <Link
                to="/orders"
                className={`nav-link ${isActive('/orders') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                My Orders
              </Link>
              <Link
                to="/profile"
                className={`nav-user-chip ${isActive('/profile') ? 'active' : ''}`}
                onClick={closeMobileMenu}
                title="View Profile"
              >
                <span className="user-initial">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
                <span className="user-name-text">{user.name.split(' ')[0]}</span>
              </Link>
              <button onClick={handleLogout} className="btn btn-outline-sm btn-logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`nav-link ${isActive('/login') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn btn-primary-sm"
                onClick={closeMobileMenu}
              >
                Get Started
              </Link>
            </>
          )}

          {/* Cart icon with item count badge */}
          <Link
            to="/cart"
            className={`cart-icon-link ${isActive('/cart') ? 'active' : ''}`}
            aria-label="Shopping cart"
            onClick={closeMobileMenu}
          >
            <span className="cart-icon">🛍️</span>
            {cartCount > 0 && (
              <span className="cart-badge">{cartCount}</span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
