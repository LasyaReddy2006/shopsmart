const express = require('express');
const router = express.Router();
const {
  getAllProducts, getCategories, getProductById,
  createProduct, updateProduct, deleteProduct
} = require('../controllers/product.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

// Public routes — anyone can browse products
router.get('/', getAllProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

// Admin-only routes — must be logged in AND be an admin
router.post('/', authenticateToken, requireAdmin, createProduct);
router.put('/:id', authenticateToken, requireAdmin, updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, deleteProduct);

module.exports = router;
