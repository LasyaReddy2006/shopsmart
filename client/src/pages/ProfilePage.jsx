// ProfilePage.jsx — User profile & account overview
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

function ProfilePage() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [ordersCount, setOrdersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadUserData() {
      try {
        setLoading(true);
        const [profileRes, ordersRes] = await Promise.all([
          api.get('/auth/profile'),
          api.get('/orders/my').catch(() => ({ data: [] }))
        ]);
        setProfile(profileRes.data);
        setOrdersCount(ordersRes.data.length);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    }
    loadUserData();
  }, []);

  function handleLogout() {
    logout();
    navigate('/');
  }

  if (loading) return <Loading message="Loading profile..." />;

  const displayUser = profile || user;

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1 className="page-title">My Account</h1>

        <ErrorMessage message={error} />

        <div className="profile-grid">
          {/* User Card */}
          <div className="profile-card user-overview-card">
            <div className="avatar-circle">
              {displayUser?.name ? displayUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <h2 className="user-name">{displayUser?.name}</h2>
            <p className="user-email">{displayUser?.email}</p>
            <div className="role-tag-container">
              <span className={`role-tag ${isAdmin ? 'admin-tag' : 'customer-tag'}`}>
                {isAdmin ? '🛡️ Administrator' : '👤 Customer'}
              </span>
            </div>

            <div className="profile-divider"></div>

            <div className="profile-meta-list">
              <div className="profile-meta-item">
                <span>Member Since</span>
                <strong>
                  {displayUser?.created_at
                    ? new Date(displayUser.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric'
                      })
                    : 'Recently'}
                </strong>
              </div>
              <div className="profile-meta-item">
                <span>Total Orders</span>
                <strong>{ordersCount}</strong>
              </div>
            </div>

            <button onClick={handleLogout} className="btn btn-outline btn-full" style={{ marginTop: '1.5rem' }}>
              Sign Out
            </button>
          </div>

          {/* Quick Actions & Navigation */}
          <div className="profile-actions-column">
            <div className="profile-section-card">
              <h3>Quick Actions</h3>
              <div className="quick-action-links">
                <Link to="/orders" className="quick-action-item">
                  <div className="action-icon">📦</div>
                  <div className="action-text">
                    <strong>My Orders</strong>
                    <p>Track packages and view order receipts</p>
                  </div>
                  <span className="action-arrow">→</span>
                </Link>

                <Link to="/cart" className="quick-action-item">
                  <div className="action-icon">🛍️</div>
                  <div className="action-text">
                    <strong>Shopping Cart</strong>
                    <p>Review items saved in your current cart</p>
                  </div>
                  <span className="action-arrow">→</span>
                </Link>

                <Link to="/products" className="quick-action-item">
                  <div className="action-icon">🔍</div>
                  <div className="action-text">
                    <strong>Browse Products</strong>
                    <p>Discover new arrivals and special deals</p>
                  </div>
                  <span className="action-arrow">→</span>
                </Link>

                {isAdmin && (
                  <Link to="/admin" className="quick-action-item admin-action-item">
                    <div className="action-icon">⚡</div>
                    <div className="action-text">
                      <strong>Admin Dashboard</strong>
                      <p>Manage catalogue, stock, revenue and orders</p>
                    </div>
                    <span className="action-arrow">→</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Security & Account Information */}
            <div className="profile-section-card security-card">
              <h3>Account Security</h3>
              <p className="security-desc">
                Your account is protected with bcrypt encryption and JWT stateless authentication.
              </p>
              <div className="security-badge-row">
                <span className="security-pill">🔒 Password Encrypted</span>
                <span className="security-pill">🛡️ Role-Based Access</span>
                <span className="security-pill">⏱️ Session Protected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
