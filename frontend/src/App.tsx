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
import RequestPayment from "./pages/landowner/RequestPayment";
import { PayoutManagement } from "./pages/landowner/PayoutManagement";
import PaymentHistory from "./pages/landowner/PaymentHistory";
import KycVerify from './pages/landowner/KycVerify';
import KycStatus from './pages/landowner/KycStatus';

// Investor Pages
import InvestorDashboard from "./pages/investor/InvestorDashboard";
import InvestorProjects from "./pages/investor/InvestorProjects";
import InvestorProjectDetails from "./pages/investor/InvestorProjectDetails";
import InvestmentHistory from "./pages/investor/InvestmentHistory";
import ManageUPI from "./pages/investor/ManageUPI";
import ManageBank from "./pages/investor/ManageBank";
import { VerifyIdentity } from "./pages/investor/VerifyIdentity";
import { KYCStatus } from "./pages/investor/KYCStatus";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLandManagement from "./pages/admin/AdminLandManagement";
import AdminViewSpecificLand from "./pages/admin/AdminViewSpecificLand";
import ManageUsers from "./pages/admin/ManageUsers";
import AdminLeasesPage from "./pages/admin/AdminLeasesPage";
import AdminEditLeasePage from "./pages/admin/AdminEditLeasePage";
import ManageProjects from "./pages/admin/ManageProjects";
import EditProjectadmin from "./pages/admin/EditProjectadmin";
import ManageInvestments from "./pages/admin/ManageInvestments";

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
          <Route path="/payouts/upi" element={<PayoutManagement type="upi" />} />
          <Route path="/payouts/bank" element={<PayoutManagement type="bank" />} />
          <Route path="/request-payment" element={<RequestPayment />} />
          <Route path="/payment-history" element={<PaymentHistory />} />
          <Route path="/profile/kyc-verify" element={<KycVerify />} />
        <Route path="/profile/kyc-status" element={<KycStatus />} />

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
            path="landowner/lands/edit/:id"
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

<Route
  path="/projects"
  element={
    <ProtectedRoute element={<InvestorProjects />} allowedRoles={["investor"]} />
  }
/>

<Route
  path="/projects/:id"
  element={
    <ProtectedRoute element={<InvestorProjectDetails />} allowedRoles={["investor"]} />
  }
/>
<Route path="/investor/verify-identity" element={<VerifyIdentity />} />
<Route path="/investor/kyc-status" element={<KYCStatus />} />
<Route path="/investments/history" element={<InvestmentHistory />} />
<Route path="/investor/upi/manage" element={<ManageUPI />} />
        <Route path="/investor/bank/manage" element={<ManageBank />} />


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
          <Route 
            path="/admin/users/landowners"
            element={<ManageUsers role="landowner" />} 
          />
          <Route
            path="/admin/users/farmers" 
            element={<ManageUsers role="farmer" />} 
          />
          <Route 
            path="/admin/users/investors"
            element={<ManageUsers role="investor" />} 
          />
          <Route
          path="/admin/manage-investments"
          element={<ManageInvestments />}
        />
          <Route 
            path="/admin/leases"
            element={<AdminLeasesPage />} 
          />
          <Route 
            path="/admin/leases/:id/edit" 
            element={<AdminEditLeasePage />} 
          />
          <Route path="/admin/manage-projects" element={<ManageProjects />} />
          <Route path="projects/:id" element={<ManageProjects />} />
          <Route path="/admin/projects/edit/:id" element={<EditProjectadmin />} />
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
