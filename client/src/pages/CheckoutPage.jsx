// CheckoutPage.jsx
// Collects delivery details and submits the order to the backend

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';

function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    delivery_name: user?.name || '',
    delivery_address: '',
    delivery_phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Basic client-side validation
    if (!form.delivery_name.trim() || !form.delivery_address.trim() || !form.delivery_phone.trim()) {
      setError('All delivery fields are required.');
      return;
    }

    // Build the items array to send to the backend
    // We only send productId and quantity — the backend fetches current prices
    const items = cartItems.map(item => ({
      productId: item.id,
      quantity: item.quantity
    }));

    try {
      setLoading(true);
      const res = await api.post('/orders', {
        items,
        delivery_name: form.delivery_name,
        delivery_address: form.delivery_address,
        delivery_phone: form.delivery_phone
      });

      // Order placed — clear the cart and navigate to confirmation
      clearCart();
      navigate(`/order-confirmation/${res.data.orderId}`, {
        state: { total: res.data.totalAmount }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="empty-state">
          <span className="empty-icon">🛒</span>
          <h3>Your cart is empty</h3>
          <button className="btn btn-primary" onClick={() => navigate('/products')}>
            Go Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1 className="page-title">Checkout</h1>

      <div className="checkout-layout">
        {/* Delivery form */}
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h2 className="checkout-section-title">Delivery Details</h2>

          <ErrorMessage message={error} />

          <div className="form-group">
            <label htmlFor="delivery_name">Full Name</label>
            <input
              id="delivery_name"
              name="delivery_name"
              type="text"
              value={form.delivery_name}
              onChange={handleChange}
              placeholder="Jane Doe"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="delivery_address">Delivery Address</label>
            <textarea
              id="delivery_address"
              name="delivery_address"
              value={form.delivery_address}
              onChange={handleChange}
              placeholder="123 Main Street, City, State, ZIP"
              className="form-input form-textarea"
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="delivery_phone">Phone Number</label>
            <input
              id="delivery_phone"
              name="delivery_phone"
              type="tel"
              value={form.delivery_phone}
              onChange={handleChange}
              placeholder="+1 555 000 0000"
              className="form-input"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-large btn-full"
            disabled={loading}
          >
            {loading ? 'Placing Order...' : `Place Order — $${cartTotal.toFixed(2)}`}
          </button>

          <p className="checkout-note">
            💡 The final total is verified by our server using current prices.
          </p>
        </form>

        {/* Order summary */}
        <aside className="checkout-summary">
          <h2 className="checkout-section-title">Order Summary</h2>
          <div className="summary-items">
            {cartItems.map(item => (
              <div key={item.id} className="summary-item-row">
                <span className="summary-item-name">{item.name} × {item.quantity}</span>
                <span>${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="summary-divider"></div>
          <div className="summary-row summary-total">
            <span>Estimated Total</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <p className="summary-demo-note">
            🎉 This is a demo order — no real payment required!
          </p>
        </aside>
      </div>
    </div>
  );
}

export default CheckoutPage;
