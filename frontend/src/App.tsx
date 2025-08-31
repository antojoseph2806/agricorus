// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Public Pages
import LandingPage from "./pages/LandingPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import Contact from "./pages/Contact";

// Farmer Pages
import FarmerDashboard from "./pages/FarmerDashboard";
import FarmerViewLands from "./pages/FarmerViewLands";
import FarmerLandDetail from "./pages/FarmerLandDetail";
import FarmerLayout from "./components/FarmerLayout";

// Landowner Pages
import LandownerDashboard from "./pages/LandownerDashboard";
import AddLand from "./pages/AddLand";
import ViewLands from "./pages/LandownerViewLands";
import ViewSpecificLand from "./pages/ViewSpecificLand";
import EditLand from "./pages/EditLand";
import LandownerLeaseRequests from "./pages/LandownerLeaseRequests";

// Investor Pages
import InvestorDashboard from "./pages/InvestorDashboard";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminLandManagement from "./pages/AdminLandManagement";
import AdminViewSpecificLand from "./pages/AdminViewSpecificLand";

// Profile Pages
import ProfileView from "./pages/ProfileView";

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

          {/* ----------------- Farmer Routes ----------------- */}
          <Route
            element={
              <ProtectedRoute element={<FarmerLayout />} allowedRoles={["farmer"]} />
            }
          >
            <Route path="/farmerdashboard" element={<FarmerDashboard />} />
            <Route path="/lands/farmer" element={<FarmerViewLands />} />
            <Route path="/farmer/lands/:id" element={<FarmerLandDetail />} />
          </Route>

          {/* ----------------- Landowner Routes ----------------- */}
          <Route
            path="/landownerdashboard"
            element={
              <ProtectedRoute
                element={<LandownerDashboard />}
                allowedRoles={["landowner"]}
              />
            }
          />
          <Route
            path="/lands/add"
            element={<ProtectedRoute element={<AddLand />} allowedRoles={["landowner"]} />}
          />
          <Route
            path="/lands/view"
            element={<ProtectedRoute element={<ViewLands />} allowedRoles={["landowner"]} />}
          />
          <Route
            path="/lands/:id"
            element={
              <ProtectedRoute element={<ViewSpecificLand />} allowedRoles={["landowner"]} />
            }
          />
          <Route
            path="/lands/edit/:id"
            element={<ProtectedRoute element={<EditLand />} allowedRoles={["landowner"]} />}
          />

          {/* Lease Requests (Landowner Only) */}
          <Route
            path="/leaserequests/all"
            element={
              <ProtectedRoute
                element={<LandownerLeaseRequests statusFilter="all" />}
                allowedRoles={["landowner"]}
              />
            }
          />
          <Route
            path="/leaserequests/accepted"
            element={
              <ProtectedRoute
                element={<LandownerLeaseRequests statusFilter="accepted" />}
                allowedRoles={["landowner"]}
              />
            }
          />
          <Route
            path="/leaserequests/cancelled"
            element={
              <ProtectedRoute
                element={<LandownerLeaseRequests statusFilter="cancelled" />}
                allowedRoles={["landowner"]}
              />
            }
          />
          <Route
            path="/leaserequests/pending"
            element={
              <ProtectedRoute
                element={<LandownerLeaseRequests statusFilter="pending" />}
                allowedRoles={["landowner"]}
              />
            }
          />

          {/* ----------------- Investor Routes ----------------- */}
          <Route
            path="/investordashboard"
            element={
              <ProtectedRoute
                element={<InvestorDashboard />}
                allowedRoles={["investor"]}
              />
            }
          />

          {/* ----------------- Admin Routes ----------------- */}
          <Route
            path="/admindashboard"
            element={
              <ProtectedRoute element={<AdminDashboard />} allowedRoles={["admin"]} />
            }
          />
          <Route
            path="/admin/lands/all"
            element={
              <ProtectedRoute
                element={<AdminLandManagement statusFilter="all" />}
                allowedRoles={["admin"]}
              />
            }
          />
          <Route
            path="/admin/lands/pending"
            element={
              <ProtectedRoute
                element={<AdminLandManagement statusFilter="pending" />}
                allowedRoles={["admin"]}
              />
            }
          />
          <Route
            path="/admin/lands/approved"
            element={
              <ProtectedRoute
                element={<AdminLandManagement statusFilter="approved" />}
                allowedRoles={["admin"]}
              />
            }
          />
          <Route
            path="/admin/lands/rejected"
            element={
              <ProtectedRoute
                element={<AdminLandManagement statusFilter="rejected" />}
                allowedRoles={["admin"]}
              />
            }
          />
          <Route
            path="/admin/lands/:id"
            element={
              <ProtectedRoute
                element={<AdminViewSpecificLand />}
                allowedRoles={["admin"]}
              />
            }
          />

          {/* ----------------- Profile Routes ----------------- */}
          <Route
            path="/profile/view"
            element={
              <ProtectedRoute
                element={<ProfileView />}
                allowedRoles={["farmer", "landowner", "investor", "admin"]}
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
