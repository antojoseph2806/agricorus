// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Public Pages
import LandingPage from "./pages/LandingPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import Contact from "./pages/Contact";
import About from "./pages/About";
import PublicViewLands from "./pages/PublicViewLands"; 
import PublicLandDetail from "./pages/PublicLandDetail";

// Farmer Pages
import FarmerDashboard from "./pages/farmer/FarmerDashboard";
import FarmerViewLands from "./pages/farmer/FarmerViewLands";
import FarmerLandDetail from "./pages/farmer/FarmerLandDetail";
import FarmerLayout from "./components/FarmerLayout";
import AcceptedLeases from "./pages/farmer/AcceptedLeases";
import CancelledLeases from "./pages/farmer/CancelledLeases";
import ActiveLeases from "./pages/farmer/ActiveLeases";
import AddProject from "./pages/farmer/AddProject";
import ViewProjects from "./pages/farmer/ViewProjects";
import ProjectDetails from "./pages/farmer/ProjectDetails";
import ApprovedProjects from "./pages/farmer/ApprovedProjects";
import ClosedProjects from "./pages/farmer/ClosedProjects";
import OngoingProjects from "./pages/farmer/OngoingProjects";
import EditProject from "./pages/farmer/EditProject";
import MyDisputes from "./pages/farmer/MyDisputes";
import AgainstDisputes from "./pages/farmer/AgainstDisputes";
// Landowner Pages
import LandownerDashboard from "./pages/landowner/LandownerDashboard";
import AddLand from "./pages/landowner/AddLand";
import ViewLands from "./pages/landowner/LandownerViewLands";
import ViewSpecificLand from "./pages/landowner/ViewSpecificLand";
import EditLand from "./pages/landowner/EditLand";
import LandownerLeaseRequests from "./pages/landowner/LandownerLeaseRequests";

// Investor Pages
import InvestorDashboard from "./pages/investor/InvestorDashboard";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLandManagement from "./pages/admin/AdminLandManagement";
import AdminViewSpecificLand from "./pages/admin/AdminViewSpecificLand";

// Profile Pages
import ProfileView from "./pages/landowner/ProfileView";

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
          <Route path="/about" element={<About />} />

          {/* Public Lands List */}
          <Route path="/public-lands" element={<PublicViewLands />} />
          <Route path="/land-details" element={<PublicLandDetail />} />

          {/* ----------------- Farmer Routes ----------------- */}
          <Route
            element={
              <ProtectedRoute element={<FarmerLayout />} allowedRoles={["farmer"]} />
            }
          >
            <Route path="/farmerdashboard" element={<FarmerDashboard />} />
            <Route path="/lands/farmer" element={<FarmerViewLands />} />
            <Route path="/farmer/lands/:id" element={<FarmerLandDetail />} />
            <Route path="/farmer/leases/accepted" element={<AcceptedLeases />} />
            <Route path="/farmer/leases/cancelled" element={<CancelledLeases />} />
            <Route path="/farmer/leases/active" element={<ActiveLeases />} />

            {/* Farmer Project Routes */}
            <Route path="/farmer/projects" element={<ViewProjects />} />
            <Route path="/farmer/projects/add" element={<AddProject />} />
            <Route path="/farmer/projects/:id" element={<ProjectDetails />} />
            <Route path="/farmer/projects/edit/:id" element={<EditProject />} />
            <Route path="/approved-projects" element={<ApprovedProjects />} />
            <Route path="/closed-projects" element={<ClosedProjects />} />
            <Route path="/ongoing-projects" element={<OngoingProjects />} />


            {/* farmer disputes routes*/}
             <Route path="/disputes/my" element={<MyDisputes />} />
             <Route path="/disputes/against" element={<AgainstDisputes />} />
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
            path="landowner/lands/view/:id"
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
          <Route
            path="/leaserequests/active"
            element={
              <ProtectedRoute
                element={<LandownerLeaseRequests statusFilter="active" />}
                allowedRoles={["landowner"]}
              />
            }
          />

          {/* ----------------- Investor Routes ----------------- */}
          <Route
            path="/investordashboard"
            element={
              <ProtectedRoute element={<InvestorDashboard />} allowedRoles={["investor"]} />
            }
          />

          {/* ----------------- Admin Routes ----------------- */}
          <Route
            path="/admindashboard"
            element={<ProtectedRoute element={<AdminDashboard />} allowedRoles={["admin"]} />}
          />
          <Route
            path="/admin/lands/all"
            element={
              <ProtectedRoute element={<AdminLandManagement statusFilter="all" />} allowedRoles={["admin"]} />
            }
          />
          <Route
            path="/admin/lands/pending"
            element={
              <ProtectedRoute element={<AdminLandManagement statusFilter="pending" />} allowedRoles={["admin"]} />
            }
          />
          <Route
            path="/admin/lands/approved"
            element={
              <ProtectedRoute element={<AdminLandManagement statusFilter="approved" />} allowedRoles={["admin"]} />
            }
          />
          <Route
            path="/admin/lands/rejected"
            element={
              <ProtectedRoute element={<AdminLandManagement statusFilter="rejected" />} allowedRoles={["admin"]} />
            }
          />
          <Route
            path="/admin/lands/:id"
            element={<ProtectedRoute element={<AdminViewSpecificLand />} allowedRoles={["admin"]} />}
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
