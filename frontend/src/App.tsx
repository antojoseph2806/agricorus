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
import Contact from './pages/Contact';
import AddLand from './pages/AddLand';
import ViewLands from './pages/LandownerViewLands';
import ViewSpecificLand from './pages/ViewSpecificLand';
import EditLand from './pages/EditLand';
import AdminLandManagement from './pages/AdminLandManagement';
import AdminViewSpecificLand from './pages/AdminViewSpecificLand';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Public Land View Route */}
          {/* This route is for any user to see an approved land listing's details */}
          <Route path="/lands/public/:id" element={<ViewSpecificLand />} />

          {/* Protected Routes for Farmers, Landowners, Investors, and Admins */}
          <Route
            path="/farmerdashboard"
            element={<ProtectedRoute element={<FarmerDashboard />} allowedRole="farmer" />}
          />
          <Route
            path="/landownerdashboard"
            element={<ProtectedRoute element={<LandownerDashboard />} allowedRole="landowner" />}
          />
          
          {/* Landowner Specific Routes */}
          <Route
            path="/lands/add"
            element={<ProtectedRoute element={<AddLand />} allowedRole="landowner" />}
          />
          <Route
            path="/lands/view"
            element={<ProtectedRoute element={<ViewLands />} allowedRole="landowner" />}
          />
          <Route
            path="/lands/:id" // This is for landowners to view their own lands
            element={<ProtectedRoute element={<ViewSpecificLand />} allowedRole="landowner" />}
          />
          <Route
            path="/lands/edit/:id"
            element={<ProtectedRoute element={<EditLand />} allowedRole="landowner" />}
          />

          <Route
            path="/investordashboard"
            element={<ProtectedRoute element={<InvestorDashboard />} allowedRole="investor" />}
          />

          {/* Admin Specific Routes */}
          <Route
            path="/admindashboard"
            element={<ProtectedRoute element={<AdminDashboard />} allowedRole="admin" />}
          />
          <Route
            path="/admin/lands/all"
            element={<ProtectedRoute element={<AdminLandManagement statusFilter="all" />} allowedRole="admin" />}
          />
          <Route
            path="/admin/lands/pending"
            element={<ProtectedRoute element={<AdminLandManagement statusFilter="pending" />} allowedRole="admin" />}
          />
          <Route
            path="/admin/lands/approved"
            element={<ProtectedRoute element={<AdminLandManagement statusFilter="approved" />} allowedRole="admin" />}
          />
          <Route
            path="/admin/lands/rejected"
            element={<ProtectedRoute element={<AdminLandManagement statusFilter="rejected" />} allowedRole="admin" />}
          />
          <Route
            path="/admin/lands/:id" // This is for admins to view any land's details
            element={<ProtectedRoute element={<AdminViewSpecificLand />} allowedRole="admin" />}
          />

          {/* Forbidden Page Route */}
          <Route path="/forbidden" element={<ForbiddenPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;