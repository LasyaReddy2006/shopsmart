// OrdersPage.jsx — Shows the logged-in customer's order history

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

// Map order status to a CSS class
const STATUS_CLASS = {
  Pending: 'status-pending',
  Processing: 'status-processing',
  Shipped: 'status-shipped',
  Delivered: 'status-delivered',
  Cancelled: 'status-cancelled'
};

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await api.get('/orders/my');
        setOrders(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load orders.');
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  if (loading) return <Loading message="Loading your orders..." />;

  return (
    <div className="orders-page">
      <h1 className="page-title">My Orders</h1>

      <ErrorMessage message={error} />

      {orders.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📦</span>
          <h3>No orders yet</h3>
          <p>When you place an order, it will appear here.</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div>
                  <span className="order-id">Order #{order.id}</span>
                  <span className="order-date">
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </span>
                </div>
                <span className={`status-badge ${STATUS_CLASS[order.status] || 'status-pending'}`}>
                  {order.status}
                </span>
              </div>
              <div className="order-card-body">
                <div className="order-info-row">
                  <span>Deliver to: {order.delivery_name}</span>
                  <strong className="order-total">${parseFloat(order.total_amount).toFixed(2)}</strong>
                </div>
              </div>
              <div className="order-card-footer">
                <Link to={`/orders/${order.id}`} className="btn btn-outline-sm">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrdersPage;
