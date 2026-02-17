# 🌾 Farmer CRUD Test Suite

Comprehensive Selenium test suite for validating all farmer role CRUD operations in the AgriCorus agricultural platform.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd tests/selenium
npm install
```

### 2. Configure Environment
```bash
# Copy example environment file
copy .env.example .env

# Edit .env with your test credentials
notepad .env
```

### 3. Start Servers
Ensure both servers are running:
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:5173

### 4. Run Tests

#### Windows
```bash
run-farmer-tests.bat
```

#### Command Line
```bash
# All tests
npm run test:farmer

# Specific suites
npm run test:farmer-projects
npm run test:farmer-lands
npm run test:farmer-leases

# By operation
npm run test:farmer-create
npm run test:farmer-read
npm run test:farmer-update
npm run test:farmer-delete
```

## 📋 What's Tested

### ✅ Full CRUD Operations
- **Projects**: Create, Read, Update, Delete
- **Lands**: Read, Filter, View Details
- **Leases**: Read by Status (Accepted, Active, Cancelled)
- **Profile**: Read, View Information
- **KYC**: Read Status, Navigate Verification
- **Disputes**: Read My Disputes, Read Against Me
- **Dashboard**: Read Statistics

### 🎯 Test Coverage
- **40+ test cases** covering all farmer features
- **7 major feature areas** tested
- **4 CRUD operations** validated for projects
- **Multiple read operations** for other features

## 📊 Test Results

Expected output:
```
✅ Project Management - CREATE (3 tests)
✅ Project Management - READ (4 tests)
✅ Project Management - UPDATE (3 tests)
✅ Project Management - DELETE (2 tests)
✅ Land Browsing - READ (4 tests)
✅ Lease Management - READ (3 tests)
✅ Profile Management - READ (2 tests)
✅ KYC Management - READ (3 tests)
✅ Dispute Management - READ (3 tests)
✅ Dashboard - READ (2 tests)

40 passing (3m 25s)
```

## 🔧 Configuration

### Environment Variables (.env)
```env
# Server URLs
BASE_URL=http://localhost:5173
API_BASE_URL=http://localhost:5000/api

# Test Credentials
FARMER_EMAIL=farmer@test.com
FARMER_PASSWORD=Test@123
FARMER_NAME=Test Farmer
FARMER_PHONE=9876543211

# Browser Settings
BROWSER=chrome
HEADLESS=false
IMPLICIT_WAIT=10000
EXPLICIT_WAIT=20000

# Screenshots
SCREENSHOT_ON_FAILURE=true
SCREENSHOT_DIR=./screenshots
```

## 🐛 Troubleshooting

### Tests Fail to Start
1. Check servers are running: `npm run check-servers`
2. Verify credentials in `.env`
3. Ensure farmer account exists and is verified

### Element Not Found Errors
1. Increase wait times in `.env`
2. Run in non-headless mode: `set HEADLESS=false`
3. Check if frontend structure changed

### Login Fails
1. Verify farmer email is verified in database
2. Check password is correct
3. Ensure backend authentication is working

### Timeout Errors
1. Increase timeout: Edit test file `this.timeout(300000)`
2. Check network speed
3. Verify server response times

## 📸 Screenshots

Failed tests automatically capture screenshots:
- Location: `tests/selenium/screenshots/`
- Format: `farmer-[test-name]-failure-[timestamp].png`

## 📚 Documentation

- **Comprehensive Guide**: See `FARMER-TEST-GUIDE.md`
- **API Reference**: Check backend routes in `backend/routes/`
- **Frontend Routes**: See `frontend/src/App.tsx`

## 🎯 Test Strategy

### Project Management (Full CRUD)
1. **Create**: Multi-step form with validation
2. **Read**: List view, search, filter, details
3. **Update**: Edit form with validation
4. **Delete**: Confirmation and verification

### Other Features (Read-Only)
- Lands: Browse, filter, view details
- Leases: View by status categories
- Profile: Display user information
- KYC: Check verification status
- Disputes: View filed and received
- Dashboard: Display statistics

## 🔄 Test Flow

```
Login → Dashboard → Projects → Lands → Leases → Profile → KYC → Disputes
  ↓         ↓          ↓         ↓        ↓        ↓       ↓       ↓
Verify   Display   CRUD Ops   Browse   Status   Info   Status  View
```

## 📈 Success Metrics

- **Pass Rate**: Target 95%+
- **Execution Time**: ~3-4 minutes
- **Coverage**: All farmer features
- **Reliability**: Consistent results

## 🛠️ Maintenance

### Updating Tests
1. Edit `farmer-crud-comprehensive.test.js`
2. Update page objects in `pages/farmer-page.js`
3. Modify locators if UI changes
4. Add new test cases as needed

### Adding New Features
1. Add locators to `FarmerPage` class
2. Create new test describe block
3. Follow existing test patterns
4. Update documentation

## 📞 Support

For issues:
1. Check `FARMER-TEST-GUIDE.md` troubleshooting
2. Review test logs and screenshots
3. Verify server status
4. Check browser console errors

## 🎉 Success!

If all tests pass, you'll see:
```
============================================================
📊 FARMER CRUD TEST SUITE SUMMARY
============================================================
✅ All farmer CRUD operations tested successfully

📋 Features Tested:
   ✓ Project Management (CREATE, READ, UPDATE, DELETE)
   ✓ Land Browsing (READ, FILTER, VIEW DETAILS)
   ✓ Lease Management (READ by status)
   ✓ Profile Management (READ)
   ✓ KYC Management (READ)
   ✓ Dispute Management (READ)
   ✓ Dashboard (READ)
============================================================
```

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Test Framework**: Selenium WebDriver + Mocha + Chai
