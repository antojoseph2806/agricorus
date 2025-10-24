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
const adminLeasePaymentRoutes = require("./routes/adminLeasePaymentRoutes");
const adminInvestmentRoutes = require("./routes/adminInvestmentRoutes");



// ------------------------
// Import middleware
// ------------------------
const auth = require('./middleware/auth');

// ------------------------
// Middleware
// ------------------------
app.use(cors({
  origin: 'http://localhost:5173', // Adjust for frontend URL in production
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
app.use("/api/admin/leases", adminLeasePaymentRoutes);
app.use("/api/admin/investments", adminInvestmentRoutes);
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