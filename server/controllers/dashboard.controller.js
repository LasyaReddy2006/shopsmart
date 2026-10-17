// dashboard.controller.js
// Provides admin statistics — all values come from real SQL queries

const pool = require('../config/db');

// GET /api/dashboard/stats  (admin only)
async function getDashboardStats(req, res) {
  try {
    // Run multiple COUNT queries simultaneously using Promise.all for speed
    const [
      [totalProducts],
      [totalOrders],
      [totalCustomers],
      [revenue]
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) AS count FROM products'),
      pool.query('SELECT COUNT(*) AS count FROM orders'),
      pool.query("SELECT COUNT(*) AS count FROM users WHERE role = 'customer'"),
      pool.query("SELECT COALESCE(SUM(total_amount), 0) AS total FROM orders WHERE status != 'Cancelled'")
    ]);

    res.json({
      totalProducts: totalProducts[0].count,
      totalOrders: totalOrders[0].count,
      totalCustomers: totalCustomers[0].count,
      totalRevenue: parseFloat(revenue[0].total)
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ message: 'Failed to fetch dashboard stats.' });
  }
}

// GET /api/dashboard/low-stock  (admin only)
// Returns products with stock quantity below 10
async function getLowStockProducts(req, res) {
  try {
    const [products] = await pool.query(
      'SELECT id, name, category, stock_quantity FROM products WHERE stock_quantity < 10 ORDER BY stock_quantity ASC'
    );
    res.json(products);
  } catch (err) {
    console.error('Low stock error:', err);
    res.status(500).json({ message: 'Failed to fetch low stock products.' });
  }
}

module.exports = { getDashboardStats, getLowStockProducts };
