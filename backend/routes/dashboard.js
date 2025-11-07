// routes/dashboard.js
const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const authorizeRoles = require('../middleware/authorizeRoles');

router.get('/admindashboard', auth, authorizeRoles('admin'), (req, res) => {
  res.json({ msg: 'Welcome Admin!' });
});

router.get('/farmerdashboard', auth, authorizeRoles('farmer'), (req, res) => {
  res.json({ msg: 'Welcome Farmer!' });
});

router.get('/investordashboard', auth, authorizeRoles('investor'), (req, res) => {
  res.json({ msg: 'Welcome Investor!' });
});

router.get('/landownerdashboard', auth, authorizeRoles('landowner'), (req, res) => {
  res.json({ msg: 'Welcome Landowner!' });
});

module.exports = router;
