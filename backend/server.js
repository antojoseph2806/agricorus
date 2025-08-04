require('dotenv').config();
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const authRouter = require('./routes/auth');
const forgotPasswordRoutes = require('./routes/forgotPassword');
const dashboardRoutes = require('./routes/dashboard'); // ✅ new import

const auth = require('./middleware/auth');

const app = express();

// ✅ Enable CORS for frontend
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// ✅ Parse JSON requests
app.use(express.json());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB error:', err));

// ✅ Routes
app.use('/api/auth', authRouter);
app.use('/api/forgot-password', forgotPasswordRoutes);
app.use('/api/dashboard', dashboardRoutes); // ✅ Add dashboard route

// ✅ Optional protected test route
app.get('/api/protected', auth, (req, res) => {
  res.json({ msg: `Welcome user ${req.user.id} with role ${req.user.role}` });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
