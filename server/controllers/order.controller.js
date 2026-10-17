// order.controller.js
// Handles order placement, retrieval and status updates
// This is the most important file in the backend — read it carefully!

const pool = require('../config/db');

// ===========================================
// POST /api/orders  (protected — customer)
// Places a new order.
// This function uses a MySQL TRANSACTION to ensure
// the order is saved atomically — either everything
// succeeds, or nothing is saved.
// ===========================================
async function placeOrder(req, res) {
  const { items, delivery_name, delivery_address, delivery_phone } = req.body;
  const userId = req.user.id; // From the JWT token — trusted, not from the client body

  // Validate delivery fields
  if (!delivery_name || !delivery_address || !delivery_phone) {
    return res.status(400).json({ message: 'Delivery name, address and phone are required.' });
  }
  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Your cart is empty.' });
  }

  // Get a dedicated connection from the pool for the transaction
  // A transaction must use the SAME connection throughout
  const conn = await pool.getConnection();

  try {
    // START TRANSACTION — database changes won't be permanent until we COMMIT
    await conn.beginTransaction();

    let totalAmount = 0;
    const orderItemsData = [];

    // For each cart item, verify stock and calculate real price
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({ message: 'Invalid item in cart.' });
      }

      // SELECT ... FOR UPDATE locks this row until the transaction ends.
      // This prevents two simultaneous orders from both seeing "stock = 1"
      // and both succeeding — only the first one gets the lock.
      const [rows] = await conn.query(
        'SELECT id, name, price, stock_quantity FROM products WHERE id = ? FOR UPDATE',
        [item.productId]
      );

      if (rows.length === 0) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({ message: `Product not found (ID: ${item.productId}).` });
      }

      const product = rows[0];

      // Check stock
      if (product.stock_quantity < item.quantity) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({
          message: `Not enough stock for "${product.name}". Available: ${product.stock_quantity}.`
        });
      }

      // Use the REAL price from the database — never trust the price from the frontend
      const lineTotal = parseFloat(product.price) * item.quantity;
      totalAmount += lineTotal;

      orderItemsData.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.price
      });
    }

    // Round to 2 decimal places to avoid floating-point issues
    totalAmount = Math.round(totalAmount * 100) / 100;

    // Insert the order record
    const [orderResult] = await conn.query(
      `INSERT INTO orders (user_id, total_amount, delivery_name, delivery_address, delivery_phone, status)
       VALUES (?, ?, ?, ?, ?, 'Pending')`,
      [userId, totalAmount, delivery_name, delivery_address, delivery_phone]
    );
    const orderId = orderResult.insertId;

    // Insert each order item and deduct stock
    for (const item of orderItemsData) {
      // Save the product name and price at time of purchase
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.productId, item.productName, item.quantity, item.unitPrice]
      );

      // Reduce stock quantity
      await conn.query(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
        [item.quantity, item.productId]
      );
    }

    // COMMIT — all changes are now permanently saved
    await conn.commit();
    conn.release();

    res.status(201).json({
      message: 'Order placed successfully!',
      orderId,
      totalAmount
    });
  } catch (err) {
    // If anything goes wrong, ROLLBACK — undo all changes
    await conn.rollback();
    conn.release();
    console.error('Place order error:', err);
    res.status(500).json({ message: 'Failed to place order. Please try again.' });
  }
}

// GET /api/orders/my  (protected — customer)
// Returns the order history for the logged-in user
async function getMyOrders(req, res) {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id] // Only this user's orders — enforced on the backend
    );
    res.json(orders);
  } catch (err) {
    console.error('Get my orders error:', err);
    res.status(500).json({ message: 'Failed to fetch orders.' });
  }
}

// GET /api/orders/:id  (protected — customer or admin)
// Returns a single order with its items
async function getOrderById(req, res) {
  try {
    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const order = orders[0];

    // Security check: customers can only view their OWN orders
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // Fetch order items for this order
    const [items] = await pool.query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [req.params.id]
    );

    res.json({ ...order, items });
  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({ message: 'Failed to fetch order.' });
  }
}

// GET /api/orders  (admin only)
// Returns all orders with the customer name (using a JOIN)
async function getAllOrders(req, res) {
  try {
    // JOIN orders with users to get the customer name alongside each order
    const [orders] = await pool.query(
      `SELECT o.*, u.name AS customer_name, u.email AS customer_email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );
    res.json(orders);
  } catch (err) {
    console.error('Get all orders error:', err);
    res.status(500).json({ message: 'Failed to fetch orders.' });
  }
}

// PUT /api/orders/:id/status  (admin only)
// Updates the status of an order
async function updateOrderStatus(req, res) {
  const { status } = req.body;
  const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}.` });
  }

  try {
    const [result] = await pool.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    res.json({ message: 'Order status updated.' });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ message: 'Failed to update order status.' });
  }
}

module.exports = { placeOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus };
