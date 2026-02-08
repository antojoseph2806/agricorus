# Agricorus Mobile App

Flutter mobile application for Agricorus platform.

## Features

- User authentication (Login/Register)
- Role-based dashboards (Landowner, Farmer, Investor)
- Token-based authentication with backend API
- Persistent login sessions

## Setup

1. Install dependencies:
```bash
cd mobile_app
flutter pub get
```

2. **API URL Configuration**:

The app is configured to use your production backend:
```dart
static const String baseUrl = 'https://agricorus.onrender.com/api';
```

This is already set in `lib/services/api_service.dart`.

For local development, you can change it to:
   - Android emulator: `http://10.0.2.2:5000/api`
   - iOS simulator: `http://localhost:5000/api`
   - Physical device: `http://YOUR_IP:5000/api`

3. Run the app:
```bash
flutter run
```

## Project Structure

```
lib/
├── main.dart                    # App entry point
├── services/
│   └── api_service.dart        # API calls & token management
└── screens/
    ├── login_page.dart         # Login screen
    ├── register_page.dart      # Registration screen
    ├── landowner_dashboard.dart
    ├── farmer_dashboard.dart
    └── investor_dashboard.dart
```

## Backend Integration

The app connects to your backend hosted on Render at `https://agricorus.onrender.com/api`.

Endpoints used:
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify-otp` - Email OTP verification
- `POST /api/auth/resend-otp` - Resend OTP

## Features Implemented

✅ Login page matching web version
✅ Register page with phone number field
✅ OTP verification flow for email
✅ Password strength validation (8+ chars, uppercase, lowercase, number, special char)
✅ Phone number validation (Indian 10-digit)
✅ Email validation
✅ Auto-login on app restart
✅ Role-based dashboard routing (landowner/farmer/investor/admin)
✅ Logout functionality
✅ Token storage (secure)

## Next Steps

- Implement individual dashboard features
- Add profile management
- Integrate KYC verification
- Add project/land listing screens
- Implement file uploads for documents
