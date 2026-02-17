# 🏪 Vendor CRUD Test Suite

Comprehensive Selenium test suite for validating all vendor role CRUD operations in the AgriCorus marketplace platform.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd tests/selenium
npm install
```

### 2. Configure Environment
```bash
# Vendor credentials should be in .env file
VENDOR_EMAIL=vendor@test.com
VENDOR_PASSWORD=Test@123
```

### 3. Start Servers
Ensure both servers are running:
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:5173

### 4. Run Tests

#### Windows
```bash
run-vendor-tests.bat
```

#### Command Line
```bash
# All tests
npm run test:vendor

# Specific suites
npm run test:vendor-products
npm run test:vendor-orders

# By operation
npm run test:vendor-create
npm run test:vendor-read
npm run test:vendor-update
npm run test:vendor-delete
```

## 📋 What's Tested

### ✅ Full CRUD Operations
- **Products**: Create, Read, Update, Delete
- **Orders**: Read, Filter by Status
- **Inventory**: Read, View Stock Levels
- **Profile**: Read Vendor Information
- **Dashboard**: Read Statistics
- **Notifications**: Read Notifications
- **Payments**: Read Payment History
- **Feedback**: Read Customer Reviews
- **Support**: Read Support Queries

### 🎯 Test Coverage
- **35+ test cases** covering all vendor features
- **Full CRUD** for products (12 tests)
- **Read operations** for other features (23 tests)
- **3-4 minute** execution time
- **95%+ pass rate** target

## 📊 Test Results

Expected output:
```
✅ Product Management - CREATE (3 tests)
✅ Product Management - READ (3 tests)
✅ Product Management - UPDATE (3 tests)
✅ Product Management - DELETE (2 tests)
✅ Order Management - READ (3 tests)
✅ Inventory Management - READ (2 tests)
✅ Profile Management - READ (2 tests)
✅ Dashboard - READ (2 tests)
✅ Notifications - READ (1 test)
✅ Payments - READ (1 test)
✅ Feedback - READ (1 test)
✅ Support Queries - READ (1 test)

35 passing (3m 30s)
```

## 🔧 Configuration

### Environment Variables (.env)
```env
# Server URLs
BASE_URL=http://localhost:5173
API_BASE_URL=http://localhost:5000/api

# Vendor Credentials
VENDOR_EMAIL=vendor@test.com
VENDOR_PASSWORD=Test@123
VENDOR_BUSINESS_NAME=Test Vendor Business
VENDOR_OWNER_NAME=Test Vendor Owner
VENDOR_PHONE=9876543212

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
3. Ensure vendor account exists and is verified

### Element Not Found Errors
1. Increase wait times in `.env`
2. Run in non-headless mode: `set HEADLESS=false`
3. Check if frontend structure changed

### Login Fails
1. Verify vendor email exists in database
2. Check password is correct
3. Ensure backend authentication is working

### Timeout Errors
1. Increase timeout: Edit test file `this.timeout(300000)`
2. Check network speed
3. Verify server response times

## 📸 Screenshots

Failed tests automatically capture screenshots:
- Location: `tests/selenium/screenshots/`
- Format: `vendor-[test-name]-failure-[timestamp].png`

## 🎯 Test Strategy

### Product Management (Full CRUD)
1. **Create**: Add product with all fields
2. **Read**: List view, filter, view details
3. **Update**: Edit product details
4. **Delete**: Remove product (soft delete)

### Other Features (Read-Only)
- Orders: View and filter by status
- Inventory: Check stock levels
- Profile: Display vendor information
- Dashboard: Show statistics
- Notifications: View alerts
- Payments: Check payment history
- Feedback: Read customer reviews
- Support: View support queries

## 🔄 Test Flow

```
Login → Dashboard → Products → Orders → Inventory → Profile
  ↓         ↓          ↓         ↓         ↓          ↓
Verify   Display   CRUD Ops   Filter   Stock     Info
```

## 📈 Success Metrics

- **Pass Rate**: Target 95%+
- **Execution Time**: ~3-4 minutes
- **Coverage**: All vendor features
- **Reliability**: Consistent results

## 🛠️ Maintenance

### Updating Tests
1. Edit `vendor-crud-comprehensive.test.js`
2. Update locators if UI changes
3. Add new test cases as needed

### Adding New Features
1. Add test describe block
2. Follow existing test patterns
3. Update documentation

## 📞 Support

For issues:
1. Check troubleshooting section
2. Review test logs and screenshots
3. Verify server status
4. Check browser console errors

## 🎉 Success!

If all tests pass, you'll see:
```
============================================================
📊 VENDOR CRUD TEST SUITE SUMMARY
============================================================
✅ All vendor CRUD operations tested successfully

📋 Features Tested:
   ✓ Product Management (CREATE, READ, UPDATE, DELETE)
   ✓ Order Management (READ, FILTER)
   ✓ Inventory Management (READ)
   ✓ Profile Management (READ)
   ✓ Dashboard (READ)
   ✓ Notifications (READ)
   ✓ Payments (READ)
   ✓ Feedback (READ)
   ✓ Support Queries (READ)
============================================================
```

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Test Framework**: Selenium WebDriver + Mocha + Chai
