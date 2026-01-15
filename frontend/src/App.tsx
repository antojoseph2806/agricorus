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

// Marketplace Pages
import Marketplace from "./pages/marketplace/Marketplace";
import ProductDetails from "./pages/marketplace/ProductDetails";
import Cart from "./pages/marketplace/Cart";
import Checkout from "./pages/marketplace/Checkout";
import OrderHistory from "./pages/marketplace/OrderHistory";
import OrderDetails from "./pages/marketplace/OrderDetails";
import ManageAddresses from "./pages/marketplace/ManageAddresses";

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
import FarmerProfile from './pages/farmer/FarmerProfile';

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
import LandownerDisputeHistory from './pages/landowner/LandownerDisputeHistory';

// Investor Pages
import InvestorDashboard from "./pages/investor/InvestorDashboard";
import InvestorProjects from "./pages/investor/InvestorProjects";
import InvestorProjectDetails from "./pages/investor/InvestorProjectDetails";
import InvestmentHistory from "./pages/investor/InvestmentHistory";
import ManageUPI from "./pages/investor/ManageUPI";
import ManageBank from "./pages/investor/ManageBank";
import { VerifyIdentity } from "./pages/investor/VerifyIdentity";
import { KYCStatus } from "./pages/investor/KYCStatus";
import InvestorProfile from "./pages/investor/InvestorProfile";
import InvestorReturnRequest from "./pages/investor/InvestorReturnRequest";
import ReturnRequestHistory from "./pages/investor/ReturnRequestHistory";


//vendor pages
import VendorRegister from "./pages/vendor/VendorRegister";
import VendorLogin from "./pages/vendor/VendorLogin";
import VendorDashboard from "./pages/vendor/VendorDashboard";
import ProductList from "./pages/vendor/ProductList";
import AddProduct from "./pages/vendor/AddProduct";
import EditProduct from "./pages/vendor/EditProduct";
import VendorProfile from "./pages/vendor/VendorProfile";
import VendorOrders from "./pages/vendor/VendorOrders";
import VendorFeedback from "./pages/vendor/VendorFeedback";
import VendorInventory from "./pages/vendor/VendorInventory";
import VendorNotifications from "./pages/vendor/VendorNotifications";
import VendorPayments from "./pages/vendor/VendorPayments";

// Vendor Analytics Pages
import VendorSalesAnalyticsDashboard from "./pages/vendor/analytics/SalesAnalyticsDashboard";
import VendorMonthlyReports from "./pages/vendor/analytics/MonthlyReports";
import VendorProductPerformance from "./pages/vendor/analytics/ProductPerformance";
import VendorCustomReports from "./pages/vendor/analytics/CustomReports";
import VendorDownloadCenter from "./pages/vendor/analytics/DownloadCenter";


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
import AdminDisputeDashboard from "./pages/admin/AdminDisputeDashboard";
import ReturnRequestsAdmin from "./pages/admin/ReturnRequests";
import AdminPaymentRequests from "./pages/admin/AdminPaymentRequests";
import VendorKycManagement from "./pages/admin/VendorKycManagement";
import UserKycManagement from "./pages/admin/UserKycManagement";
import VerifiedVendors from "./pages/admin/VerifiedVendors";
import AdminDisputeManager from "./pages/admin/AdminDisputeManager";

// Sales Analytics Pages
import SalesOverview from "./pages/admin/SalesAnalytics/SalesOverview";
import MonthlyReports from "./pages/admin/SalesAnalytics/MonthlyReports";
import ProductPerformance from "./pages/admin/SalesAnalytics/ProductPerformance";
import RevenueTrends from "./pages/admin/SalesAnalytics/RevenueTrends";
import DownloadReports from "./pages/admin/SalesAnalytics/DownloadReports";

// Profile Pages
import ProfileView from "./pages/landowner/ProfileView";

// Shared
import ProtectedRoute from "./components/ProtectedRoute";
import ForbiddenPage from "./pages/ForbiddenPage";
import FarmerKYCStatus from "./pages/farmer/FarmerKYCStatus";
import FarmerKYCVerify from "./pages/farmer/FarmerKYCVerify";

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
          <Route path="/land-details/:id" element={<PublicLandDetail />} />

          {/* Marketplace Routes (Public) */}
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/product/:id" element={<ProductDetails />} />

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

            <Route
              path="/farmer/profile"
              element={<FarmerProfile />}
            />

            {/* Farmer Project Routes */}
            <Route path="/farmer/projects" element={<ViewProjects />} />
            <Route path="/farmer/projects/add" element={<AddProject />} />
            <Route path="/farmer/projects/:id" element={<ProjectDetails />} />
            <Route path="/farmer/projects/edit/:id" element={<EditProject />} />
            <Route path="/approved-projects" element={<ApprovedProjects />} />
            <Route path="/closed-projects" element={<ClosedProjects />} />
            <Route path="/ongoing-projects" element={<OngoingProjects />} />

            <Route path="/farmer/kyc/verify" element={<FarmerKYCVerify />} />
            <Route path="/farmer/kyc/status" element={<FarmerKYCStatus />} />



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
            path="/landowner/disputes"
            element={
              <ProtectedRoute
                element={<LandownerDisputeHistory />}
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
          <Route
            path="/investor/verify-identity"
            element={
              <ProtectedRoute element={<VerifyIdentity />} allowedRoles={["investor"]} />
            }
          />
          <Route
            path="/investor/kyc-status"
            element={
              <ProtectedRoute element={<KYCStatus />} allowedRoles={["investor"]} />
            }
          />
          <Route
            path="/investments/history"
            element={
              <ProtectedRoute element={<InvestmentHistory />} allowedRoles={["investor"]} />
            }
          />
          <Route
            path="/investor/upi/manage"
            element={
              <ProtectedRoute element={<ManageUPI />} allowedRoles={["investor"]} />
            }
          />
          <Route
            path="/investor/profile"
            element={
              <ProtectedRoute element={<InvestorProfile />} allowedRoles={["investor"]} />
            }
          />
          <Route
            path="/investor/bank/manage"
            element={
              <ProtectedRoute element={<ManageBank />} allowedRoles={["investor"]} />
            }
          />
          <Route
            path="/investor/return-request"
            element={
              <ProtectedRoute element={<InvestorReturnRequest />} allowedRoles={["investor"]} />
            }
          />
          <Route
            path="/investor/return-requests-history"
            element={
              <ProtectedRoute element={<ReturnRequestHistory />} allowedRoles={["investor"]} />
            }
          />
          {/* ----------------- Vendor Routes ----------------- */}
          <Route path="/vendor/register" element={<VendorRegister />} />
          <Route path="/vendor/login" element={<VendorLogin />} />
          <Route
            path="/vendor/dashboard"
            element={
              <ProtectedRoute
                element={<VendorDashboard />}
                allowedRoles={["vendor"]}
              />
            }
          />
          <Route
            path="/vendor/products"
            element={
              <ProtectedRoute
                element={<ProductList />}
                allowedRoles={["vendor"]}
              />
            }
          />
          <Route
            path="/vendor/products/add"
            element={
              <ProtectedRoute
                element={<AddProduct />}
                allowedRoles={["vendor"]}
              />
            }
          />
          <Route
            path="/vendor/products/edit/:id"
            element={
              <ProtectedRoute
                element={<EditProduct />}
                allowedRoles={["vendor"]}
              />
            }
          />
          <Route
            path="/vendor/profile"
            element={
              <ProtectedRoute
                element={<VendorProfile />}
                allowedRoles={["vendor"]}
              />
            }
          />
          <Route
            path="/vendor/orders"
            element={
              <ProtectedRoute
                element={<VendorOrders />}
                allowedRoles={["vendor"]}
              />
            }
          />
          <Route
            path="/vendor/feedback"
            element={
              <ProtectedRoute
                element={<VendorFeedback />}
                allowedRoles={["vendor"]}
              />
            }
          />
          <Route
            path="/vendor/inventory"
            element={
              <ProtectedRoute
                element={<VendorInventory />}
                allowedRoles={["vendor"]}
              />
            }
          />
          <Route
            path="/vendor/notifications"
            element={
              <ProtectedRoute
                element={<VendorNotifications />}
                allowedRoles={["vendor"]}
              />
            }
          />
          <Route
            path="/vendor/payments"
            element={
              <ProtectedRoute
                element={<VendorPayments />}
                allowedRoles={["vendor"]}
              />
            }
          />
          {/* Vendor Analytics Routes */}
          <Route
            path="/vendor/analytics/dashboard"
            element={
              <ProtectedRoute
                element={<VendorSalesAnalyticsDashboard />}
                allowedRoles={["vendor"]}
              />
            }
          />
          <Route
            path="/vendor/analytics/monthly"
            element={
              <ProtectedRoute
                element={<VendorMonthlyReports />}
                allowedRoles={["vendor"]}
              />
            }
          />
          <Route
            path="/vendor/analytics/products"
            element={
              <ProtectedRoute
                element={<VendorProductPerformance />}
                allowedRoles={["vendor"]}
              />
            }
          />
          <Route
            path="/vendor/analytics/reports"
            element={
              <ProtectedRoute
                element={<VendorCustomReports />}
                allowedRoles={["vendor"]}
              />
            }
          />
          <Route
            path="/vendor/analytics/downloads"
            element={
              <ProtectedRoute
                element={<VendorDownloadCenter />}
                allowedRoles={["vendor"]}
              />
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
          <Route path="/admin/return-requests" element={<ReturnRequestsAdmin />} />
          <Route
            path="/admin/vendor-kyc"
            element={<ProtectedRoute element={<VendorKycManagement />} allowedRoles={["admin"]} />}
          />
          <Route
            path="/admin/verified-vendors"
            element={<ProtectedRoute element={<VerifiedVendors />} allowedRoles={["admin"]} />}
          />
          <Route
            path="/admin/user-kyc/all"
            element={<ProtectedRoute element={<UserKycManagement />} allowedRoles={["admin"]} />}
          />
          <Route
            path="/admin/user-kyc/farmers"
            element={<ProtectedRoute element={<UserKycManagement />} allowedRoles={["admin"]} />}
          />
          <Route
            path="/admin/user-kyc/landowners"
            element={<ProtectedRoute element={<UserKycManagement />} allowedRoles={["admin"]} />}
          />
          <Route
            path="/admin/user-kyc/investors"
            element={<ProtectedRoute element={<UserKycManagement />} allowedRoles={["admin"]} />}
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
          <Route path="/admin/projects/:id" element={<ManageProjects />} />
          <Route path="/admin/projects/edit/:id" element={<EditProjectadmin />} />
          <Route path="/admin/landowner/disputes" element={<AdminDisputeDashboard />} />
          <Route path="/admin/farmer/disputes" element={<AdminDisputeManager />} />
          
          {/* Sales Analytics Routes */}
          <Route
            path="/admin/sales-analytics/overview"
            element={<ProtectedRoute element={<SalesOverview />} allowedRoles={["admin"]} />}
          />
          <Route
            path="/admin/sales-analytics/monthly"
            element={<ProtectedRoute element={<MonthlyReports />} allowedRoles={["admin"]} />}
          />
          <Route
            path="/admin/sales-analytics/products"
            element={<ProtectedRoute element={<ProductPerformance />} allowedRoles={["admin"]} />}
          />
          <Route
            path="/admin/sales-analytics/revenue"
            element={<ProtectedRoute element={<RevenueTrends />} allowedRoles={["admin"]} />}
          />
          <Route
            path="/admin/sales-analytics/download"
            element={<ProtectedRoute element={<DownloadReports />} allowedRoles={["admin"]} />}
          />
          
          <Route
            path="/admin/payment-requests"
            element={
              <AdminPaymentRequests />
            }
          />
          {/* ----------------- Marketplace Routes (Protected) ----------------- */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute
                element={<Cart />}
                allowedRoles={["farmer", "landowner", "investor"]}
              />
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute
                element={<Checkout />}
                allowedRoles={["farmer", "landowner", "investor"]}
              />
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute
                element={<OrderHistory />}
                allowedRoles={["farmer", "landowner", "investor"]}
              />
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute
                element={<OrderDetails />}
                allowedRoles={["farmer", "landowner", "investor"]}
              />
            }
          />
          <Route
            path="/addresses"
            element={
              <ProtectedRoute
                element={<ManageAddresses />}
                allowedRoles={["farmer", "landowner", "investor"]}
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
