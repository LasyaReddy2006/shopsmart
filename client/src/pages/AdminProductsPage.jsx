// AdminProductsPage.jsx — Admin can view, add, edit and delete products

import { useState, useEffect } from 'react';
import api from '../services/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

// Empty form values for the Add/Edit form
const EMPTY_FORM = {
  name: '', description: '', price: '', category: '',
  image_url: '', stock_quantity: ''
};

function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // The form shown when adding or editing
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null = adding
  const [form, setForm] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      setError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  }

  function openAddForm() {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowForm(true);
  }

  function openEditForm(product) {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category,
      image_url: product.image_url || '',
      stock_quantity: product.stock_quantity
    });
    setFormError('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingProduct(null);
  }

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');

    if (!form.name.trim() || !form.price || !form.category.trim()) {
      setFormError('Name, price and category are required.');
      return;
    }

    try {
      setFormLoading(true);
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, form);
        setSuccess('Product updated successfully.');
      } else {
        await api.post('/products', form);
        setSuccess('Product added successfully.');
      }
      closeForm();
      fetchProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(product) {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/products/${product.id}`);
      setSuccess('Product deleted.');
      fetchProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product.');
    }
  }

  if (loading) return <Loading message="Loading products..." />;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="page-title">Manage Products</h1>
        <button className="btn btn-primary" onClick={openAddForm}>+ Add Product</button>
      </div>

      <ErrorMessage message={error} />
      {success && <div className="success-message">✅ {success}</div>}

      {/* Add / Edit modal form */}
      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <ErrorMessage message={formError} />
            <form onSubmit={handleSubmit} className="admin-product-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} className="form-input" required />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <input name="category" value={form.category} onChange={handleChange} className="form-input" required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price ($) *</label>
                  <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} className="form-input" required />
                </div>
                <div className="form-group">
                  <label>Stock Quantity *</label>
                  <input name="stock_quantity" type="number" min="0" value={form.stock_quantity} onChange={handleChange} className="form-input" required />
                </div>
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input name="image_url" value={form.image_url} onChange={handleChange} className="form-input" placeholder="https://..." />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} className="form-input form-textarea" rows={3} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={closeForm}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products table */}
      {products.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📦</span>
          <h3>No products yet</h3>
          <button className="btn btn-primary" onClick={openAddForm}>Add your first product</button>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>#{product.id}</td>
                  <td className="product-name-cell">{product.name}</td>
                  <td><span className="product-category-badge small">{product.category}</span></td>
                  <td>${parseFloat(product.price).toFixed(2)}</td>
                  <td>
                    <span className={product.stock_quantity === 0 ? 'text-red' : product.stock_quantity < 10 ? 'text-orange' : ''}>
                      {product.stock_quantity}
                    </span>
                  </td>
                  <td className="table-actions">
                    <button className="btn btn-outline-sm" onClick={() => openEditForm(product)}>Edit</button>
                    <button className="btn btn-danger-sm" onClick={() => handleDelete(product)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminProductsPage;
