// OrderDetailPage.jsx — Shows the full details of a single order

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const STATUS_CLASS = {
  Pending: 'status-pending',
  Processing: 'status-processing',
  Shipped: 'status-shipped',
  Delivered: 'status-delivered',
  Cancelled: 'status-cancelled'
};

function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load order.');
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  if (loading) return <Loading message="Loading order details..." />;
  if (error) return (
    <div className="orders-page">
      <ErrorMessage message={error} />
      <button className="btn btn-outline-sm" onClick={() => navigate(-1)}>← Back</button>
    </div>
  );

  return (
    <div className="orders-page">
      <button className="btn btn-outline-sm back-btn" onClick={() => navigate(-1)}>← Back to Orders</button>

      <h1 className="page-title">Order #{order.id}</h1>

      {/* Visual Status Tracker */}
      {order.status === 'Cancelled' ? (
        <div className="order-cancelled-banner">
          <span>❌ This order has been cancelled.</span>
        </div>
      ) : (
        <div className="order-tracker">
          {['Pending', 'Processing', 'Shipped', 'Delivered'].map((step, idx) => {
            const stepOrder = { Pending: 1, Processing: 2, Shipped: 3, Delivered: 4 };
            const currentStep = stepOrder[order.status] || 1;
            const isCompleted = currentStep >= idx + 1;
            const isCurrent = currentStep === idx + 1;

            const stepIcons = {
              Pending: '📝',
              Processing: '⚙️',
              Shipped: '🚚',
              Delivered: '📦'
            };

            return (
              <div key={step} className={`tracker-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                <div className="tracker-icon-wrap">
                  <span className="tracker-icon">{isCompleted && !isCurrent ? '✓' : stepIcons[step]}</span>
                </div>
                <div className="tracker-label">{step === 'Pending' ? 'Placed' : step}</div>
                {idx < 3 && <div className={`tracker-line ${currentStep > idx + 1 ? 'filled' : ''}`} />}
              </div>
            );
          })}
        </div>
      )}

      {/* Order metadata */}
      <div className="order-detail-meta">
        <div className="meta-row">
          <span>Date</span>
          <span>{new Date(order.created_at).toLocaleString()}</span>
        </div>
        <div className="meta-row">
          <span>Status</span>
          <span className={`status-badge ${STATUS_CLASS[order.status] || 'status-pending'}`}>
            {order.status}
          </span>
        </div>
        <div className="meta-row">
          <span>Deliver to</span>
          <span>{order.delivery_name}</span>
        </div>
        <div className="meta-row">
          <span>Address</span>
          <span>{order.delivery_address}</span>
        </div>
        <div className="meta-row">
          <span>Phone</span>
          <span>{order.delivery_phone}</span>
        </div>
      </div>

      {/* Order items */}
      <h2 className="checkout-section-title" style={{ marginTop: '2rem' }}>Items Ordered</h2>
      <div className="order-items-table">
        <div className="order-items-header">
          <span>Product</span>
          <span>Unit Price</span>
          <span>Qty</span>
          <span>Subtotal</span>
        </div>
        {order.items?.map(item => (
          <div key={item.id} className="order-items-row">
            <span>{item.product_name}</span>
            <span>${parseFloat(item.unit_price).toFixed(2)}</span>
            <span>{item.quantity}</span>
            <span>${(parseFloat(item.unit_price) * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="order-items-footer">
          <span></span>
          <span></span>
          <strong>Total</strong>
          <strong>${parseFloat(order.total_amount).toFixed(2)}</strong>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailPage;
