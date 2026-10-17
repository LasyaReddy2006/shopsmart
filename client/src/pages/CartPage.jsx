// CartPage.jsx — Displays the shopping cart and a checkout button

import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';

function CartPage() {
  const { cartItems, cartTotal, clearCart } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <h1 className="page-title">Shopping Cart</h1>
        <div className="empty-state">
          <span className="empty-icon">🛍️</span>
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added anything yet.</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1 className="page-title">Shopping Cart</h1>
        <button className="btn btn-outline-sm" onClick={clearCart}>Clear Cart</button>
      </div>

      <div className="cart-layout">
        {/* Cart items */}
        <div className="cart-items-section">
          {/* Column headers */}
          <div className="cart-column-headers">
            <span>Product</span>
            <span>Quantity</span>
            <span>Total</span>
            <span></span>
          </div>
          {cartItems.map(item => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        {/* Order summary sidebar */}
        <aside className="cart-summary">
          <h2 className="summary-title">Order Summary</h2>

          {/* Free shipping progress bar */}
          <div className="shipping-progress-box">
            {cartTotal >= 50 ? (
              <span className="shipping-progress-text success">🎉 You unlocked FREE Shipping!</span>
            ) : (
              <span className="shipping-progress-text">
                Add <strong>${(50 - cartTotal).toFixed(2)}</strong> more to get <strong>FREE Shipping</strong>
              </span>
            )}
            <div className="shipping-bar-bg">
              <div
                className="shipping-bar-fill"
                style={{ width: `${Math.min(100, (cartTotal / 50) * 100)}%` }}
              />
            </div>
          </div>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Estimated Delivery</span>
            <span className="free-shipping">{cartTotal >= 50 ? 'FREE' : '$4.99'}</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>${(cartTotal + (cartTotal >= 50 ? 0 : 4.99)).toFixed(2)}</span>
          </div>
          <p className="summary-note">
            ⚠️ Final total is confirmed by the server at checkout.
          </p>
          <Link to="/checkout" className="btn btn-primary btn-full">
            Proceed to Checkout
          </Link>
          <Link to="/products" className="btn btn-outline btn-full" style={{ marginTop: '0.75rem' }}>
            Continue Shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}

export default CartPage;
