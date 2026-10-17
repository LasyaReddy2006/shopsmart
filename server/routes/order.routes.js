const express = require('express');
const router = express.Router();
const {
  placeOrder, getMyOrders, getOrderById,
  getAllOrders, updateOrderStatus
} = require('../controllers/order.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

// Customer routes (require login)
router.post('/', authenticateToken, placeOrder);
router.get('/my', authenticateToken, getMyOrders);
router.get('/:id', authenticateToken, getOrderById);

// Admin routes
router.get('/', authenticateToken, requireAdmin, getAllOrders);
router.put('/:id/status', authenticateToken, requireAdmin, updateOrderStatus);

module.exports = router;
