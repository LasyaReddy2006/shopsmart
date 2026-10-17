// ProductDetailPage.jsx — Shows a single product with full details

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const FALLBACK_IMAGE = 'https://placehold.co/600x450/e2e8f0/64748b?text=No+Image';

function ProductDetailPage() {
  const { id } = useParams(); // The product ID from the URL: /products/:id
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState('');

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Product not found.');
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  if (loading) return <Loading message="Loading product..." />;
  if (error) return (
    <div className="detail-error">
      <ErrorMessage message={error} />
      <button className="btn btn-outline-sm" onClick={() => navigate(-1)}>← Go Back</button>
    </div>
  );

  // How many of this product is already in the cart?
  const cartItem = cartItems.find(i => i.id === product.id);
  const inCart = cartItem ? cartItem.quantity : 0;
  const maxCanAdd = product.stock_quantity - inCart;
  const isOutOfStock = product.stock_quantity === 0;

  function handleAddToCart() {
    addToCart(product, quantity);
    setAddedMessage('Added to cart!');
    setTimeout(() => setAddedMessage(''), 2500);
  }

  return (
    <div className="product-detail-page">
      <button className="btn btn-outline-sm back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="product-detail-grid">
        {/* Left: Image */}
        <div className="product-detail-image-section">
          <img
            src={product.image_url || FALLBACK_IMAGE}
            alt={product.name}
            className="product-detail-image"
            onError={e => { e.target.src = FALLBACK_IMAGE; }}
          />
        </div>

        {/* Right: Info */}
        <div className="product-detail-info">
          <span className="product-category-badge large">{product.category}</span>
          <h1 className="product-detail-name">{product.name}</h1>
          <p className="product-detail-price">${parseFloat(product.price).toFixed(2)}</p>

          <p className="product-detail-description">{product.description}</p>

          {/* Stock status */}
          <div className="stock-status">
            {isOutOfStock ? (
              <span className="stock-badge out">Out of Stock</span>
            ) : product.stock_quantity <= 5 ? (
              <span className="stock-badge low">Only {product.stock_quantity} left!</span>
            ) : (
              <span className="stock-badge in">In Stock ({product.stock_quantity} available)</span>
            )}
          </div>

          {/* Quantity selector + Add to cart */}
          {!isOutOfStock && (
            <div className="add-to-cart-section">
              <div className="qty-selector">
                <button
                  className="qty-btn"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >−</button>
                <span className="qty-value">{quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => setQuantity(q => Math.min(maxCanAdd, q + 1))}
                  disabled={quantity >= maxCanAdd}
                >+</button>
              </div>
              <button
                className="btn btn-primary btn-large"
                onClick={handleAddToCart}
                disabled={maxCanAdd <= 0}
              >
                {maxCanAdd <= 0 ? 'Already in Cart (max)' : 'Add to Cart'}
              </button>
            </div>
          )}

          {addedMessage && (
            <p className="added-success">✅ {addedMessage}</p>
          )}

          {inCart > 0 && (
            <p className="cart-info-note">You have {inCart} in your cart.</p>
          )}

          {/* Trust Guarantees */}
          <div className="product-trust-badges">
            <div className="trust-badge-item">
              <span className="trust-icon">🚚</span>
              <div>
                <strong>Free Delivery</strong>
                <p>Eligible for free shipping on orders over $50</p>
              </div>
            </div>
            <div className="trust-badge-item">
              <span className="trust-icon">↩️</span>
              <div>
                <strong>30-Day Returns</strong>
                <p>Hassle-free returns and instant replacement</p>
              </div>
            </div>
            <div className="trust-badge-item">
              <span className="trust-icon">🔒</span>
              <div>
                <strong>Secure Transaction</strong>
                <p>Protected by end-to-end encryption</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
