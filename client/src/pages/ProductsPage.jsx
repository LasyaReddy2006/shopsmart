// ProductsPage.jsx — Lists all products with search, filter, and sort

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // useSearchParams lets us read and update URL query params (?category=Electronics)
  const [searchParams, setSearchParams] = useSearchParams();

  // Read current filter values from the URL
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'All';
  const sort = searchParams.get('sort') || '';

  // Fetch products whenever filters change
  useEffect(() => {
    fetchProducts();
  }, [search, category, sort]);

  // Fetch available categories once on mount
  useEffect(() => {
    api.get('/products/categories')
      .then(res => setCategories(['All', ...res.data]))
      .catch(() => {}); // Non-critical, silently ignore
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (search) params.search = search;
      if (category && category !== 'All') params.category = category;
      if (sort) params.sort = sort;

      const res = await api.get('/products', { params });
      setProducts(res.data);
    } catch (err) {
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Update a single query param without clearing the others
  function updateFilter(key, value) {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  }

  function handleSearch(e) {
    e.preventDefault();
    const value = e.target.search.value.trim();
    updateFilter('search', value);
  }

  return (
    <div className="products-page">
      <div className="products-page-header">
        <h1 className="page-title">All Products</h1>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="search-form">
          <input
            id="search-input"
            name="search"
            type="text"
            placeholder="Search products..."
            defaultValue={search}
            className="search-input"
          />
          <button type="submit" className="btn btn-primary search-btn">Search</button>
          {search && (
            <button type="button" className="btn btn-outline-sm" onClick={() => updateFilter('search', '')}>
              Clear
            </button>
          )}
        </form>
      </div>

      <div className="products-layout">
        {/* Sidebar filters */}
        <aside className="filters-sidebar">
          <h3 className="filter-title">Category</h3>
          <ul className="category-filter-list">
            {categories.map(cat => (
              <li key={cat}>
                <button
                  className={`category-filter-btn ${category === cat ? 'active' : ''}`}
                  onClick={() => updateFilter('category', cat === 'All' ? '' : cat)}
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>

          <h3 className="filter-title" style={{ marginTop: '1.5rem' }}>Sort By</h3>
          <select
            className="sort-select"
            value={sort}
            onChange={e => updateFilter('sort', e.target.value)}
            id="sort-select"
          >
            <option value="">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
          </select>
        </aside>

        {/* Product grid */}
        <main className="products-main">
          {loading ? (
            <Loading message="Fetching products..." />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : products.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🔍</span>
              <h3>No products found</h3>
              <p>Try adjusting your search or filter.</p>
            </div>
          ) : (
            <>
              <p className="results-count">{products.length} product{products.length !== 1 ? 's' : ''} found</p>
              <div className="products-grid">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default ProductsPage;
