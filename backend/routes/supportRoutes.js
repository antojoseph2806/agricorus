const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const vendorAuth = require('../middleware/vendorAuth');
const {
  getUserMessages,
  sendUserMessage,
  getVendorQueries,
  sendVendorReply,
  updateQueryStatus
} = require('../controllers/supportController');

// User routes (buyers: landowner, farmer, investor)
router.get('/messages', auth, getUserMessages);
router.post('/messages', auth, sendUserMessage);

// Vendor routes
router.get('/vendor/queries', vendorAuth, getVendorQueries);
router.post('/vendor/reply', vendorAuth, sendVendorReply);
router.patch('/vendor/status', vendorAuth, updateQueryStatus);

module.exports = router;
