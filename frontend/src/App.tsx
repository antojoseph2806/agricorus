import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import FarmerDashboard from './pages/FarmerDashboard';
import LandownerDashboard from './pages/LandownerDashboard';
import InvestorDashboard from './pages/InvestorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ForbiddenPage from './pages/ForbiddenPage';
import Contact from './pages/Contact'; // ✅ New import

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/farmerdashboard"
            element={<ProtectedRoute element={<FarmerDashboard />} allowedRole="farmer" />}
          />
          <Route
            path="/landownerdashboard"
            element={<ProtectedRoute element={<LandownerDashboard />} allowedRole="landowner" />}
          />
          <Route
            path="/investordashboard"
            element={<ProtectedRoute element={<InvestorDashboard />} allowedRole="investor" />}
          />
          <Route
            path="/admindashboard"
            element={<ProtectedRoute element={<AdminDashboard />} allowedRole="admin" />}
          />
          <Route path="/forbidden" element={<ForbiddenPage />} />
          <Route path="/contact" element={<Contact/>} /> {/* ✅ New Contact Route */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
