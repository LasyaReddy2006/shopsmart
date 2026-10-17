// product.controller.js
// Handles all product-related API requests

const pool = require('../config/db');

// GET /api/products
// Returns all products, with optional search, category filter and sorting
async function getAllProducts(req, res) {
  try {
    const { search, category, sort } = req.query;

    // We build the SQL query dynamically based on what filters were provided
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    // Search by name (LIKE with % wildcards for partial matching)
    if (search) {
      sql += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }

    // Filter by category (exact match)
    if (category && category !== 'All') {
      sql += ' AND category = ?';
      params.push(category);
    }

    // Sort order
    if (sort === 'price_asc') {
      sql += ' ORDER BY price ASC';
    } else if (sort === 'price_desc') {
      sql += ' ORDER BY price DESC';
    } else if (sort === 'name_asc') {
      sql += ' ORDER BY name ASC';
    } else {
      sql += ' ORDER BY created_at DESC'; // Default: newest first
    }

    const [products] = await pool.query(sql, params);
    res.json(products);
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ message: 'Failed to fetch products.' });
  }
}

// GET /api/products/categories
// Returns a list of distinct categories for the filter dropdown
async function getCategories(req, res) {
  try {
    const [rows] = await pool.query('SELECT DISTINCT category FROM products ORDER BY category ASC');
    const categories = rows.map(r => r.category);
    res.json(categories);
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ message: 'Failed to fetch categories.' });
  }
}

// GET /api/products/:id
// Returns a single product by ID
async function getProductById(req, res) {
  try {
    const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json(products[0]);
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({ message: 'Failed to fetch product.' });
  }
}

// POST /api/products  (admin only)
// Creates a new product
async function createProduct(req, res) {
  const { name, description, price, category, image_url, stock_quantity } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ message: 'Name, price and category are required.' });
  }
  if (isNaN(price) || price < 0) {
    return res.status(400).json({ message: 'Price must be a positive number.' });
  }
  if (isNaN(stock_quantity) || stock_quantity < 0) {
    return res.status(400).json({ message: 'Stock quantity must be 0 or more.' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO products (name, description, price, category, image_url, stock_quantity) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description || '', price, category, image_url || '', stock_quantity || 0]
    );
    res.status(201).json({ message: 'Product created.', productId: result.insertId });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ message: 'Failed to create product.' });
  }
}

// PUT /api/products/:id  (admin only)
// Updates an existing product
async function updateProduct(req, res) {
  const { name, description, price, category, image_url, stock_quantity } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ message: 'Name, price and category are required.' });
  }

  try {
    const [result] = await pool.query(
      `UPDATE products 
       SET name=?, description=?, price=?, category=?, image_url=?, stock_quantity=?
       WHERE id=?`,
      [name, description || '', price, category, image_url || '', stock_quantity || 0, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json({ message: 'Product updated successfully.' });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ message: 'Failed to update product.' });
  }
}

// DELETE /api/products/:id  (admin only)
// Deletes a product
async function deleteProduct(req, res) {
  try {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json({ message: 'Product deleted successfully.' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ message: 'Failed to delete product.' });
  }
}

module.exports = {
  getAllProducts,
  getCategories,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
