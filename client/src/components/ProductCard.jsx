// ProductCard.jsx
// Displays a single product in the product grid

import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

// Fallback image shown when the product image URL fails to load
const FALLBACK_IMAGE = 'https://placehold.co/400x300/e2e8f0/64748b?text=No+Image';

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const isOutOfStock = product.stock_quantity === 0;

  function handleAddToCart() {
    addToCart(product, 1);
  }

  return (
    <div className="product-card">
      {/* Product image with fallback */}
      <Link to={`/products/${product.id}`} className="product-card-image-link">
        <img
          src={product.image_url || FALLBACK_IMAGE}
          alt={product.name}
          className="product-card-image"
          onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
          loading="lazy"
        />
        {isOutOfStock && (
          <div className="out-of-stock-overlay">Out of Stock</div>
        )}
      </Link>

      {/* Product details */}
      <div className="product-card-body">
        <span className="product-category-badge">{product.category}</span>
        <Link to={`/products/${product.id}`} className="product-card-name-link">
          <h3 className="product-name">{product.name}</h3>
        </Link>
        <div className="product-card-footer">
          <span className="product-price">${parseFloat(product.price).toFixed(2)}</span>
          <button
            className={`btn ${isOutOfStock ? 'btn-disabled' : 'btn-primary'}`}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            aria-label={`Add ${product.name} to cart`}
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
        {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
          <p className="low-stock-warning">Only {product.stock_quantity} left!</p>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
