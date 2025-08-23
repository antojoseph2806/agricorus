// server.js
require('dotenv').config();
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');

// Import routes (must be routers)
const authRouter = require('./routes/auth');
const forgotPasswordRoutes = require('./routes/forgotPassword');
const dashboardRoutes = require('./routes/dashboard');
const landownerRoutes = require('./routes/landowner');
const leaseRoutes = require('./routes/lease');
const paymentRoutes = require('./routes/payment');
const disputeRoutes = require('./routes/dispute');
const adminRouter = require('./routes/admin');
const farmerRoutes = require('./routes/farmer'); // ✅ Import the new farmer router

// Import middleware
const auth = require('./middleware/auth');

const app = express();

// ------------------------
// Middleware
// ------------------------
app.use(cors({
  origin: 'http://localhost:5173', // Adjust to frontend URL
  credentials: true
}));
app.use(express.json());

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
// Debug route type check (helps catch errors)
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
  ['farmer', farmerRoutes], // ✅ Add the new farmer router to the list
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
app.use('/api/farmer', farmerRoutes); // ✅ Add the new farmer router endpoint

// Test protected route
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
