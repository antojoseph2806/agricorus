// App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Public Pages
import LandingPage from "./pages/LandingPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import Contact from "./pages/Contact";

// Farmer Pages
import FarmerDashboard from "./pages/FarmerDashboard";
import FarmerViewLands from "./pages/FarmerViewLands";
import FarmerLandDetail from "./pages/FarmerLandDetail"; // ✅ new detail page
import FarmerLayout from "./components/FarmerLayout";

// Landowner Pages
import LandownerDashboard from "./pages/LandownerDashboard";
import AddLand from "./pages/AddLand";
import ViewLands from "./pages/LandownerViewLands";
import ViewSpecificLand from "./pages/ViewSpecificLand";
import EditLand from "./pages/EditLand";

// Investor Pages
import InvestorDashboard from "./pages/InvestorDashboard";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminLandManagement from "./pages/AdminLandManagement";
import AdminViewSpecificLand from "./pages/AdminViewSpecificLand";

// Shared
import ProtectedRoute from "./components/ProtectedRoute";
import ForbiddenPage from "./pages/ForbiddenPage";

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          {/* ----------------- Public Routes ----------------- */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/contact" element={<Contact />} />

          {/* Public Land View Route */}
          <Route path="/lands/public/:id" element={<ViewSpecificLand />} />

          {/* ----------------- Farmer Routes (with FarmerNavbar) ----------------- */}
          <Route
            element={
              <ProtectedRoute
                element={<FarmerLayout />}
                allowedRole="farmer"
              />
            }
          >
            <Route path="/farmerdashboard" element={<FarmerDashboard />} />
            <Route path="/lands/farmer" element={<FarmerViewLands />} />
            <Route path="/farmer/lands/:id" element={<FarmerLandDetail />} /> {/* ✅ new detail route */}
          </Route>

          {/* ----------------- Landowner Routes ----------------- */}
          <Route
            path="/landownerdashboard"
            element={
              <ProtectedRoute
                element={<LandownerDashboard />}
                allowedRole="landowner"
              />
            }
          />
          <Route
            path="/lands/add"
            element={
              <ProtectedRoute element={<AddLand />} allowedRole="landowner" />
            }
          />
          <Route
            path="/lands/view"
            element={
              <ProtectedRoute element={<ViewLands />} allowedRole="landowner" />
            }
          />
          <Route
            path="/lands/:id"
            element={
              <ProtectedRoute
                element={<ViewSpecificLand />}
                allowedRole="landowner"
              />
            }
          />
          <Route
            path="/lands/edit/:id"
            element={
              <ProtectedRoute element={<EditLand />} allowedRole="landowner" />
            }
          />

          {/* ----------------- Investor Routes ----------------- */}
          <Route
            path="/investordashboard"
            element={
              <ProtectedRoute
                element={<InvestorDashboard />}
                allowedRole="investor"
              />
            }
          />

          {/* ----------------- Admin Routes ----------------- */}
          <Route
            path="/admindashboard"
            element={
              <ProtectedRoute
                element={<AdminDashboard />}
                allowedRole="admin"
              />
            }
          />
          <Route
            path="/admin/lands/all"
            element={
              <ProtectedRoute
                element={<AdminLandManagement statusFilter="all" />}
                allowedRole="admin"
              />
            }
          />
          <Route
            path="/admin/lands/pending"
            element={
              <ProtectedRoute
                element={<AdminLandManagement statusFilter="pending" />}
                allowedRole="admin"
              />
            }
          />
          <Route
            path="/admin/lands/approved"
            element={
              <ProtectedRoute
                element={<AdminLandManagement statusFilter="approved" />}
                allowedRole="admin"
              />
            }
          />
          <Route
            path="/admin/lands/rejected"
            element={
              <ProtectedRoute
                element={<AdminLandManagement statusFilter="rejected" />}
                allowedRole="admin"
              />
            }
          />
          <Route
            path="/admin/lands/:id"
            element={
              <ProtectedRoute
                element={<AdminViewSpecificLand />}
                allowedRole="admin"
              />
            }
          />

          {/* ----------------- Forbidden Page ----------------- */}
          <Route path="/forbidden" element={<ForbiddenPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
