import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  ClipboardCheck,
  ShoppingCart,
  Truck,
  Wallet,
  Star,
  MessageSquare,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronDown,
  Store,
  Bell,
  BarChart3,
  TrendingUp,
  FileText,
  Download,
  Calendar,
  PieChart,
  User,
  UserCircle
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import NotificationBell from "../../components/vendor/NotificationBell";

/* ---------- Types ---------- */
interface NavItem {
  label: string;
  icon: React.ElementType;
  href?: string;
  children?: NavItem[];
}

/* ---------- Sidebar ---------- */
const VendorSidebar = ({
  isOpen,
  toggleSidebar,
}: {
  isOpen: boolean;
  toggleSidebar: () => void;
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navigate = useNavigate();

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/vendor/dashboard",
    },
    {
      label: "Products",
      icon: Package,
      children: [
        { label: "Add Product", icon: Store, href: "/vendor/products/add" },
        { label: "Manage Products", icon: Package, href: "/vendor/products" },
      ],
    },
    {
      label: "Inventory",
      icon: Settings,
      href: "/vendor/inventory",
    },
    {
      label: "Orders",
      icon: ShoppingCart,
      href: "/vendor/orders",
    },
    {
      label: "Sales Analytics",
      icon: BarChart3,
      children: [
        { label: "Sales Dashboard", icon: TrendingUp, href: "/vendor/analytics/dashboard" },
        { label: "Monthly Reports", icon: Calendar, href: "/vendor/analytics/monthly" },
        { label: "Custom Reports", icon: FileText, href: "/vendor/analytics/reports" },
      ],
    },
    {
      label: "Notifications",
      icon: Bell,
      href: "/vendor/notifications",
    },
    {
      label: "Payments",
      icon: Wallet,
      href: "/vendor/payments",
    },
    {
      label: "Support",
      icon: MessageSquare,
      children: [
        { label: "Customer Queries", icon: MessageSquare, href: "/vendor/support/queries" },
        { label: "Warranty / Service", icon: ShieldCheck, href: "/vendor/support/warranty" },
      ],
    },
    {
      label: "Ratings & Feedback",
      icon: Star,
      href: "/vendor/feedback",
    },
    {
      label: "Profile & KYC",
      icon: ShieldCheck,
      href: "/vendor/profile",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/vendor/login");
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-white border-r shadow-md transition-all duration-300 ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b">
        <div className="flex items-center gap-2">
          <Store className="w-7 h-7 text-green-600" />
          {isOpen && (
            <span className="text-lg font-bold text-gray-800">
              Vendor Panel
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {isOpen && <NotificationBell />}
          <button 
            onClick={toggleSidebar}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <ChevronDown
              className={`w-5 h-5 text-gray-700 transition-transform ${
                isOpen ? "rotate-90" : "-rotate-90"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1">
        {navItems.map((item, index) =>
          item.children ? (
            <div key={index}>
              <button
                onClick={() =>
                  setOpenDropdown(openDropdown === item.label ? null : item.label)
                }
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-green-50"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-green-600" />
                  {isOpen && <span>{item.label}</span>}
                </div>
                {isOpen && (
                  <ChevronDown
                    className={`w-4 h-4 ${
                      openDropdown === item.label ? "rotate-180" : ""
                    }`}
                  />
                )}
              </button>

              {isOpen && openDropdown === item.label && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.children.map((child, idx) => (
                    <Link
                      key={idx}
                      to={child.href!}
                      className="flex items-center gap-3 px-3 py-2 text-sm rounded hover:bg-green-100"
                    >
                      <child.icon className="w-4 h-4" />
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Link
              key={index}
              to={item.href!}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-50"
            >
              <item.icon className="w-5 h-5 text-green-600" />
              {isOpen && <span>{item.label}</span>}
            </Link>
          )
        )}
      </nav>

      {/* Logout */}
      <div className="absolute bottom-0 w-full p-3 border-t">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-5 h-5" />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

/* ---------- Profile Dropdown ---------- */
const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [vendorName, setVendorName] = useState("Vendor");
  const [showKycModal, setShowKycModal] = useState(false);
  const [kycStatus, setKycStatus] = useState<{
    isVerified: boolean;
    status: string;
    loading: boolean;
  }>({
    isVerified: false,
    status: 'pending',
    loading: false
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Get vendor name from localStorage or API
    const storedName = localStorage.getItem("vendorName") || localStorage.getItem("userName");
    if (storedName) {
      setVendorName(storedName);
    }
  }, []);

  const fetchKycStatus = async () => {
    setKycStatus(prev => ({ ...prev, loading: true }));
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${(import.meta as any).env.VITE_BACKEND_URL || "https://agricorus.onrender.com"}/api/vendor/profile/status`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await response.json();
      
      if (data.success && data.data) {
        const status = data.data.kycStatus || 'PENDING';
        const isVerified = status === 'VERIFIED';
        
        setKycStatus({
          isVerified,
          status: status.toLowerCase(),
          loading: false
        });
      } else {
        setKycStatus({
          isVerified: false,
          status: 'not_submitted',
          loading: false
        });
      }
    } catch (error) {
      console.error("Error fetching KYC status:", error);
      setKycStatus({
        isVerified: false,
        status: 'error',
        loading: false
      });
    }
  };

  const handleKycClick = () => {
    setIsOpen(false);
    fetchKycStatus();
    setShowKycModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("vendorName");
    localStorage.removeItem("userName");
    navigate("/vendor/login");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-green-600 bg-green-50';
      case 'submitted':
        return 'text-blue-600 bg-blue-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return '✓';
      case 'submitted':
        return '📄';
      case 'pending':
        return '⏳';
      case 'rejected':
        return '✗';
      default:
        return '?';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'submitted':
        return 'Submitted - Under Review';
      case 'pending':
        return 'Pending Submission';
      case 'rejected':
        return 'Rejected';
      case 'not_submitted':
        return 'Not Submitted';
      default:
        return 'Unknown';
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
            {vendorName.charAt(0).toUpperCase()}
          </div>
          <div className="text-left hidden md:block">
            <div className="text-sm font-medium text-gray-900">{vendorName}</div>
            <div className="text-xs text-gray-500">Vendor Account</div>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="text-sm font-medium text-gray-900">{vendorName}</div>
                <div className="text-xs text-gray-500">Vendor Account</div>
              </div>
              
              <Link
                to="/vendor/profile"
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <UserCircle className="w-4 h-4" />
                View Profile
              </Link>
              
              <Link
                to="/vendor/profile"
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="w-4 h-4" />
                Edit Profile
              </Link>
              
              <button
                onClick={handleKycClick}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                KYC Status
              </button>
              
              <div className="border-t border-gray-100 my-2"></div>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </>
        )}
      </div>

      {/* KYC Status Modal */}
      {showKycModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">KYC Verification Status</h2>
                <button
                  onClick={() => setShowKycModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {kycStatus.loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600">Checking verification status...</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl mb-6 ${getStatusColor(kycStatus.status)}`}>
                    {getStatusIcon(kycStatus.status)}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {getStatusText(kycStatus.status)}
                  </h3>
                  
                  <p className="text-gray-600 mb-6">
                    {kycStatus.isVerified ? (
                      "Your KYC verification is complete. You have full access to all vendor features."
                    ) : kycStatus.status === 'submitted' ? (
                      "Your KYC documents are under review. We'll notify you once verified."
                    ) : kycStatus.status === 'pending' ? (
                      "You haven't submitted KYC documents yet. Complete KYC to access all features."
                    ) : kycStatus.status === 'rejected' ? (
                      "Your KYC verification was rejected. Please resubmit with correct documents."
                    ) : kycStatus.status === 'not_submitted' ? (
                      "You haven't submitted KYC documents yet. Complete KYC to access all features."
                    ) : (
                      "Unable to fetch KYC status. Please try again later."
                    )}
                  </p>

                  {!kycStatus.isVerified && kycStatus.status !== 'submitted' && (
                    <button
                      onClick={() => {
                        setShowKycModal(false);
                        navigate('/vendor/profile');
                      }}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      Complete KYC Verification
                    </button>
                  )}

                  {kycStatus.status === 'submitted' && (
                    <button
                      onClick={() => setShowKycModal(false)}
                      className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                    >
                      Close
                    </button>
                  )}

                  {kycStatus.isVerified && (
                    <button
                      onClick={() => setShowKycModal(false)}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      Close
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* ---------- Layout Wrapper ---------- */
const VendorLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <VendorSidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <main
        className={`flex-1 transition-all ${
          isSidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        {/* Top Bar with Profile */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-end">
            <ProfileDropdown />
          </div>
        </div>
        
        {/* Main Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default VendorLayout;
