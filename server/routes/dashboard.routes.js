const express = require('express');
const router = express.Router();
const { getDashboardStats, getLowStockProducts } = require('../controllers/dashboard.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

router.get('/stats', authenticateToken, requireAdmin, getDashboardStats);
router.get('/low-stock', authenticateToken, requireAdmin, getLowStockProducts);

module.exports = router;
