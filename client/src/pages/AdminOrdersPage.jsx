// AdminOrdersPage.jsx — Admin can view all orders and update their status

import { useState, useEffect, Fragment } from 'react';
import api from '../services/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const STATUS_CLASS = {
  Pending: 'status-pending',
  Processing: 'status-processing',
  Shipped: 'status-shipped',
  Delivered: 'status-delivered',
  Cancelled: 'status-cancelled'
};

function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (err) {
      setError('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(orderId, newStatus) {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setSuccess(`Order #${orderId} updated to "${newStatus}".`);
      setOrders(prev =>
        prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
      );
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    }
  }

  async function toggleExpand(orderId) {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }
    setExpandedOrder(orderId);
    // Load order items if not already fetched
    if (!orderItems[orderId]) {
      try {
        const res = await api.get(`/orders/${orderId}`);
        setOrderItems(prev => ({ ...prev, [orderId]: res.data.items }));
      } catch (err) {
        setError('Failed to load order items.');
      }
    }
  }

  if (loading) return <Loading message="Loading orders..." />;

  return (
    <div className="admin-page">
      <h1 className="page-title">Manage Orders</h1>

      <ErrorMessage message={error} />
      {success && <div className="success-message">✅ {success}</div>}

      {orders.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📋</span>
          <h3>No orders yet</h3>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Update Status</th>
                <th>Items</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <Fragment key={order.id}>
                  <tr>
                    <td>#{order.id}</td>
                    <td>
                      <strong>{order.customer_name}</strong>
                      <br />
                      <small className="text-muted">{order.customer_email}</small>
                    </td>
                    <td>
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </td>
                    <td><strong>${parseFloat(order.total_amount).toFixed(2)}</strong></td>
                    <td>
                      <span className={`status-badge ${STATUS_CLASS[order.status] || 'status-pending'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <select
                        className="status-select"
                        value={order.status}
                        onChange={e => handleStatusChange(order.id, e.target.value)}
                        id={`status-select-${order.id}`}
                      >
                        {STATUSES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        className="btn btn-outline-sm"
                        onClick={() => toggleExpand(order.id)}
                      >
                        {expandedOrder === order.id ? 'Hide' : 'View'}
                      </button>
                    </td>
                  </tr>

                  {/* Expandable row showing order items */}
                  {expandedOrder === order.id && (
                    <tr className="order-items-expanded-row">
                      <td colSpan={7}>
                        <div className="order-items-expanded">
                          <strong>Delivery:</strong> {order.delivery_name}, {order.delivery_address}, {order.delivery_phone}
                          <div style={{ marginTop: '0.5rem' }}>
                            {orderItems[order.id] ? (
                              <table className="items-mini-table">
                                <thead>
                                  <tr>
                                    <th>Product</th>
                                    <th>Unit Price</th>
                                    <th>Qty</th>
                                    <th>Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {orderItems[order.id].map(item => (
                                    <tr key={item.id}>
                                      <td>{item.product_name}</td>
                                      <td>${parseFloat(item.unit_price).toFixed(2)}</td>
                                      <td>{item.quantity}</td>
                                      <td>${(parseFloat(item.unit_price) * item.quantity).toFixed(2)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <p>Loading items...</p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminOrdersPage;
