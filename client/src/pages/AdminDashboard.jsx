// AdminDashboard.jsx — Overview stats and low-stock alerts for admins

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, lowStockRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/low-stock')
        ]);
        setStats(statsRes.data);
        setLowStock(lowStockRes.data);
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <Loading message="Loading dashboard..." />;

  return (
    <div className="admin-page">
      <h1 className="page-title">Admin Dashboard</h1>

      <ErrorMessage message={error} />

      {/* Stats grid */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card stat-blue">
            <span className="stat-icon">📦</span>
            <div className="stat-info">
              <span className="stat-value">{stats.totalProducts}</span>
              <span className="stat-label">Products</span>
            </div>
          </div>
          <div className="stat-card stat-green">
            <span className="stat-icon">🛒</span>
            <div className="stat-info">
              <span className="stat-value">{stats.totalOrders}</span>
              <span className="stat-label">Total Orders</span>
            </div>
          </div>
          <div className="stat-card stat-purple">
            <span className="stat-icon">👥</span>
            <div className="stat-info">
              <span className="stat-value">{stats.totalCustomers}</span>
              <span className="stat-label">Customers</span>
            </div>
          </div>
          <div className="stat-card stat-orange">
            <span className="stat-icon">💰</span>
            <div className="stat-info">
              <span className="stat-value">${stats.totalRevenue.toFixed(2)}</span>
              <span className="stat-label">Revenue</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick navigation */}
      <div className="admin-nav-cards">
        <Link to="/admin/products" className="admin-nav-card">
          <span>📦</span>
          <strong>Manage Products</strong>
          <p>Add, edit and delete products</p>
        </Link>
        <Link to="/admin/orders" className="admin-nav-card">
          <span>📋</span>
          <strong>Manage Orders</strong>
          <p>View and update order statuses</p>
        </Link>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="low-stock-section">
          <h2 className="section-subtitle">⚠️ Low Stock Alert</h2>
          <div className="low-stock-table">
            <div className="table-header">
              <span>Product</span>
              <span>Category</span>
              <span>Stock</span>
              <span>Action</span>
            </div>
            {lowStock.map(product => (
              <div key={product.id} className="table-row">
                <span>{product.name}</span>
                <span>{product.category}</span>
                <span className={product.stock_quantity === 0 ? 'text-red' : 'text-orange'}>
                  {product.stock_quantity === 0 ? 'OUT OF STOCK' : product.stock_quantity}
                </span>
                <Link to={`/admin/products`} className="btn btn-outline-sm">
                  Edit
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
