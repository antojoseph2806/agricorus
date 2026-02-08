# Quick Start Guide

## Running the App

### 1. Backend is Already Hosted
Your backend is live at: **https://agricorus.onrender.com**

No need to start the backend locally!

### 2. API URL is Pre-configured

The mobile app is already configured to use your production backend:
```dart
static const String baseUrl = 'https://agricorus.onrender.com/api';
```

### 3. Run Flutter App

```bash
cd mobile_app
flutter run
```

Select your device when prompted (Chrome, Android, iOS).

## Test Credentials

Use existing users from your backend or register new ones through the app.

**Registration requires:**
- Full name (3+ chars, no numbers)
- Valid email
- 10-digit Indian phone number (starts with 6-9)
- Strong password (8+ chars, uppercase, lowercase, number, special char)
- Role selection (landowner/farmer/investor)
- Email OTP verification

**Roles available:**
- Landowner
- Farmer
- Investor
- Admin (routes to farmer dashboard for now)

## Features Implemented

✅ Login page with email/password (matches web)
✅ Register page with phone number field (matches web)
✅ OTP verification flow for email (matches web)
✅ Password strength validation (matches web rules)
✅ Phone number validation (Indian 10-digit)
✅ Email validation (matches web)
✅ Auto-login on app restart
✅ Role-based dashboard routing
✅ Logout functionality
✅ Token storage (secure)
✅ 30-second resend OTP cooldown

## Next Development Steps

1. Implement dashboard features (lands, projects, investments)
2. Add KYC verification screens
3. Integrate file uploads
4. Add marketplace functionality
5. Implement notifications
