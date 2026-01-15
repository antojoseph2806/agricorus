const express = require('express');
const router = express.Router();
const {
  getSalesOverview,
  getMonthlySales,
  getProductPerformance,
  getRevenueTrends,
  downloadReport
} = require('../controllers/salesAnalyticsController');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/auth');

// All routes require admin authentication
router.use(auth);
router.use(requireRole(['admin']));

// Sales overview endpoint
router.get('/overview', getSalesOverview);

// Monthly sales data
router.get('/monthly', getMonthlySales);

// Product performance data
router.get('/products', getProductPerformance);

// Revenue trends data
router.get('/revenue', getRevenueTrends);

// Download reports
router.get('/download', downloadReport);

module.exports = router;