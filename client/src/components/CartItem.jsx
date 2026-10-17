// CartItem.jsx
// Displays a single item in the shopping cart

import { useCart } from '../context/CartContext';

const FALLBACK_IMAGE = 'https://placehold.co/80x80/e2e8f0/64748b?text=?';

function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="cart-item">
      {/* Product thumbnail */}
      <img
        src={item.image_url || FALLBACK_IMAGE}
        alt={item.name}
        className="cart-item-image"
        onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
      />

      {/* Product info */}
      <div className="cart-item-info">
        <h4 className="cart-item-name">{item.name}</h4>
        <p className="cart-item-price">${parseFloat(item.price).toFixed(2)} each</p>
      </div>

      {/* Quantity controls */}
      <div className="cart-item-quantity">
        <button
          className="qty-btn"
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          aria-label="Decrease quantity"
        >−</button>
        <span className="qty-value">{item.quantity}</span>
        <button
          className="qty-btn"
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          disabled={item.quantity >= item.stock_quantity}
          aria-label="Increase quantity"
        >+</button>
      </div>

      {/* Line total */}
      <div className="cart-item-total">
        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
      </div>

      {/* Remove button */}
      <button
        className="cart-item-remove"
        onClick={() => removeFromCart(item.id)}
        aria-label="Remove item"
      >✕</button>
    </div>
  );
}

export default CartItem;
