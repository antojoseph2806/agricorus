// server.js
require('dotenv').config();
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

// ------------------------
// Import routes
// ------------------------
const authRouter = require('./routes/auth');
const forgotPasswordRoutes = require('./routes/forgotPassword');
const dashboardRoutes = require('./routes/dashboard');
const landownerRoutes = require('./routes/landowner');
const leaseRoutes = require('./routes/lease');
const paymentRoutes = require('./routes/payment');
const disputeRoutes = require('./routes/dispute');
const adminRouter = require('./routes/admin');
const farmerRoutes = require('./routes/farmer');
const profileRoutes = require('./routes/profileRoutes');
const projectRoutes = require('./routes/projectRoutes');
const adminUserRoutes = require("./routes/adminUserRoutes");
const adminLeaseRoutes = require("./routes/adminLeaseRoutes");
const payoutRoutes = require("./routes/payoutRoutes");
const paymentRequestRoutes = require("./routes/paymentRequestRoutes");
const projectPaymentsRoutes = require("./routes/projectPayments");
const kycRoutes = require('./routes/kycRoute');
const adminKycRoutes = require('./routes/adminKycRoutes');
const adminUserKycRoutes = require('./routes/adminUserKycRoutes');
const adminProjectRoutes = require('./routes/adminProjectRoutes');
const adminLeasePaymentRoutes = require("./routes/adminLeasePaymentRoutes");
const adminInvestmentRoutes = require("./routes/adminInvestmentRoutes");
const landownerDisputeRoutes = require("./routes/landownerDispute");
const investorReturnRequestRoutes = require("./routes/investorReturnRequest");
const vendorAuthRoutes = require("./routes/vendorAuth");
const productRoutes = require("./routes/productRoutes");
const vendorProfileRoutes = require("./routes/vendorProfileRoutes");
const marketplaceRoutes = require("./routes/marketplaceRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const vendorReviewRoutes = require("./routes/vendorReviewRoutes");
const addressRoutes = require("./routes/addressRoutes");
const salesAnalyticsRoutes = require("./routes/salesAnalyticsRoutes");


// ------------------------
// Import middleware
// ------------------------
const auth = require('./middleware/auth');

// ------------------------
// Middleware
// ------------------------
const allowedOrigins = [
  'http://localhost:5173',
  'https://agricorus.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// ✅ Serve uploaded images (profile pictures, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ------------------------
// Database Connection
// ------------------------
mongoose.connect(process.env.MONGO_URI, {})
  .then(async () => {
    console.log('✅ MongoDB connected');

    // ---- AUTO-FIX USER INDEXES ----
    const User = require('./models/User');
    try {
      console.log('🔍 Checking User indexes...');

      const indexes = await User.collection.indexes();
      const phoneIndex = indexes.find((idx) => idx.name === 'phone_1');

      if (phoneIndex) {
        console.log('⚠️ Found old phone_1 index, dropping...');
        await User.collection.dropIndex('phone_1');
      }

      await User.collection.createIndex({ phone: 1 }, { unique: true, sparse: true });
      console.log('✅ phone index recreated with sparse:true');
    } catch (err) {
      console.error('❌ Index migration error:', err.message);
    }
    // ---- END FIX ----
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ------------------------
// Debug route type check
// ------------------------
const routesList = [
  ['auth', authRouter],
  ['forgotPassword', forgotPasswordRoutes],
  ['dashboard', dashboardRoutes],
  ['landowner', landownerRoutes],
  ['leases', leaseRoutes],
  ['payments', paymentRoutes],
  ['disputes', disputeRoutes],
  ['admin', adminRouter],
  ['farmer', farmerRoutes],
  ['profile', profileRoutes],
  ['projects', projectRoutes],
];

routesList.forEach(([name, router]) => {
  if (typeof router !== 'function') {
    console.error(`❌ ERROR: Route "${name}" is not exporting a function. Check module.exports in routes/${name}.js`);
  }
});

// ------------------------
// Routes
// ------------------------
app.use('/api/auth', authRouter);
app.use('/api/forgot-password', forgotPasswordRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/landowner', landownerRoutes);
app.use('/api/leases', leaseRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/admin', adminRouter);
app.use('/api/farmer', farmerRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/projects', projectRoutes);
app.use("/admin/users", adminUserRoutes);
app.use("/api/admin/leases", adminLeaseRoutes);
app.use("/api/payouts", payoutRoutes);
app.use("/api/payment-requests", paymentRequestRoutes);
app.use("/api/project-payments", projectPaymentsRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/admin/kyc', adminKycRoutes);
app.use('/api/admin/user-kyc', adminUserKycRoutes);
app.use('/api/admin', adminProjectRoutes);
app.use("/api/admin/leases", adminLeasePaymentRoutes);
app.use("/api/admin/investments", adminInvestmentRoutes);
app.use("/api/landowner/disputes", landownerDisputeRoutes);
app.use("/api/investor/return-requests", investorReturnRequestRoutes);
app.use("/api/vendors", require("./routes/vendorAuth"));
app.use("/api/vendor/products", productRoutes);
app.use("/api/vendor/profile", vendorProfileRoutes);
app.use("/api/vendor/orders", require("./routes/vendorOrderRoutes"));
app.use("/api/marketplace/products", marketplaceRoutes);
app.use("/api/marketplace/payments", require("./routes/marketplacePaymentRoutes"));
app.use("/api/marketplace/support", require("./routes/supportRoutes"));
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/vendor/reviews", vendorReviewRoutes);
app.use("/api/vendor/inventory", require("./routes/inventoryRoutes"));
app.use("/api/vendor/notifications", require("./routes/notificationRoutes"));
app.use("/api/vendor/payments", require("./routes/vendorPaymentRoutes"));
app.use("/api/vendor/notifications", require("./routes/notificationRoutes"));
app.use("/api/addresses", addressRoutes);
app.use("/api/admin/sales-analytics", salesAnalyticsRoutes);
app.use("/api/vendor/analytics", require("./routes/vendorAnalyticsRoutes"));
// ------------------------
// Test protected route
// ------------------------
app.get('/api/protected', auth, (req, res) => {
  res.json({ msg: `Welcome user ${req.user.id} with role ${req.user.role}` });
});

// ------------------------
// Global 404 handler
// ------------------------
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ------------------------
// Start server
// ------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});