const express = require('express');
const router = express.Router();
const {
  getSalesMetrics,
  getChartData,
  getTopProducts,
  getRecentOrders,
  getMonthlyReport,
  getProductPerformance,
  downloadMonthlyReport,
  generateCustomReport,
  saveReportConfig,
  getDownloadHistory,
  downloadFile,
  deleteReport,
  generateQuickReport
} = require('../controllers/vendorAnalyticsController');
const vendorAuth = require('../middleware/vendorAuth');

// All routes require vendor authentication
router.use(vendorAuth);

// Dashboard metrics
router.get('/metrics', getSalesMetrics);

// Chart data for trends
router.get('/chart', getChartData);

// Top performing products
router.get('/top-products', getTopProducts);

// Recent orders
router.get('/recent-orders', getRecentOrders);

// Monthly report
router.get('/monthly-report', getMonthlyReport);

// Download monthly report
router.get('/download-monthly-report', downloadMonthlyReport);

// Product performance
router.get('/product-performance', getProductPerformance);

// Custom reports
router.post('/generate-custom-report', generateCustomReport);
router.post('/save-report-config', saveReportConfig);

// Download center
router.get('/download-history', getDownloadHistory);
router.get('/download-file/:reportId', downloadFile);
router.delete('/delete-report/:reportId', deleteReport);
router.post('/generate-quick-report', generateQuickReport);

module.exports = router;
