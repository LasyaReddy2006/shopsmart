// OrderConfirmationPage.jsx — Shown after a successful order

import { useParams, useLocation, Link } from 'react-router-dom';

function OrderConfirmationPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const total = location.state?.total;

  return (
    <div className="confirmation-page">
      <div className="confirmation-card">
        <div className="confirmation-icon">🎉</div>
        <h1 className="confirmation-title">Order Confirmed!</h1>
        <p className="confirmation-subtitle">
          Thank you for your purchase. Your order has been received.
        </p>

        <div className="confirmation-details">
          <div className="confirmation-row">
            <span>Order ID</span>
            <strong>#{orderId}</strong>
          </div>
          {total !== undefined && (
            <div className="confirmation-row">
              <span>Total Paid</span>
              <strong>${parseFloat(total).toFixed(2)}</strong>
            </div>
          )}
          <div className="confirmation-row">
            <span>Status</span>
            <span className="status-badge status-pending">Pending</span>
          </div>
        </div>

        <p className="confirmation-message">
          This is a demo order. In a real store, you would receive an email confirmation.
          You can track your order status in <strong>My Orders</strong>.
        </p>

        <div className="confirmation-actions">
          <Link to="/orders" className="btn btn-primary">View My Orders</Link>
          <Link to="/products" className="btn btn-outline">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmationPage;
