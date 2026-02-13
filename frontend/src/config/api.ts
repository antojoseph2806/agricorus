// API Configuration
export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
    VERIFY_OTP: `${API_BASE_URL}/api/auth/verify-otp`,
    RESEND_OTP: `${API_BASE_URL}/api/auth/resend-otp`,
  },
  PROFILE: `${API_BASE_URL}/api/profile`,
  KYC: {
    STATUS: `${API_BASE_URL}/api/kyc/status`,
  },
  LANDOWNER: {
    LANDS: `${API_BASE_URL}/api/landowner/lands`,
    MY_LANDS: `${API_BASE_URL}/api/landowner/lands/my`,
    ACTIVE_LEASES: `${API_BASE_URL}/api/landowner/leases/active`,
    PAYMENT_HISTORY: `${API_BASE_URL}/api/landowner/payments/history`,
  },
  FARMER: {
    ACTIVE_LEASES: `${API_BASE_URL}/api/farmer/leases/active`,
    ACCEPTED_LEASES: `${API_BASE_URL}/api/farmer/leases/accepted`,
    CANCELLED_LEASES: `${API_BASE_URL}/api/farmer/leases/cancelled`,
  },
  LEASE: `${API_BASE_URL}/api/lease`,
  PAYMENTS: {
    ORDER: `${API_BASE_URL}/api/payments/order`,
    VERIFY: `${API_BASE_URL}/api/payments/verify`,
  },
  DISPUTES: `${API_BASE_URL}/api/disputes`,
  MARKETPLACE: {
    PRODUCTS: `${API_BASE_URL}/api/marketplace/products`,
  },
  ORDERS: `${API_BASE_URL}/api/orders`,
};

// Helper function to build API URL
export const buildApiUrl = (path: string): string => {
  return `${API_BASE_URL}${path}`;
};
