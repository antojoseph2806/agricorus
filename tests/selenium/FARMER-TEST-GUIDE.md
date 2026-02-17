# Farmer CRUD Test Suite - Comprehensive Guide

## 📋 Overview

This comprehensive test suite validates all CRUD (Create, Read, Update, Delete) operations available to farmers in the AgriCorus platform using Selenium WebDriver.

## 🎯 Features Tested

### 1. Project Management (Full CRUD)
- ✅ **CREATE**: Add new farming projects with verification details
- ✅ **READ**: View all projects, search, filter by status/verification
- ✅ **UPDATE**: Edit project details (title, funding goal, etc.)
- ✅ **DELETE**: Remove projects from the system

### 2. Land Browsing (READ)
- ✅ View available lands for lease
- ✅ Filter lands by price range and soil type
- ✅ View detailed land information
- ✅ Navigate land listings

### 3. Lease Management (READ)
- ✅ View accepted leases
- ✅ View active leases
- ✅ View cancelled leases
- ✅ Track lease status

### 4. Profile Management (READ/UPDATE)
- ✅ View farmer profile information
- ✅ Display user details

### 5. KYC Management (READ)
- ✅ View KYC verification status
- ✅ Navigate to KYC verification page
- ✅ Check verification requirements

### 6. Dispute Management (READ)
- ✅ View disputes filed by farmer
- ✅ View disputes filed against farmer
- ✅ Track dispute status

### 7. Dashboard (READ)
- ✅ View dashboard statistics
- ✅ Display key metrics
- ✅ Navigate dashboard sections

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v14 or higher)
2. **npm** or **yarn**
3. **Chrome/Edge browser** installed
4. **Backend server** running on `http://localhost:5000`
5. **Frontend server** running on `http://localhost:5173`

### Installation

```bash
cd tests/selenium
npm install
```

### Configuration

1. Copy `.env.example` to `.env`:
```bash
copy .env.example .env
```

2. Update `.env` with your test credentials:
```env
# Frontend URL
BASE_URL=http://localhost:5173

# Backend API URL
API_BASE_URL=http://localhost:5000/api

# Farmer Test Credentials
FARMER_EMAIL=farmer@test.com
FARMER_PASSWORD=Test@123
FARMER_NAME=Test Farmer
FARMER_PHONE=9876543211

# Browser Configuration
BROWSER=chrome
HEADLESS=false
IMPLICIT_WAIT=10000
EXPLICIT_WAIT=20000
```

## 🧪 Running Tests

### Run All Farmer Tests
```bash
npm run test:farmer
```

### Run Specific Test Suites

#### Project Management Tests
```bash
npm run test:farmer-projects
```

#### Land Browsing Tests
```bash
npm run test:farmer-lands
```

#### Lease Management Tests
```bash
npm run test:farmer-leases
```

### Run by CRUD Operation

#### CREATE Operations Only
```bash
npm run test:farmer-create
```

#### READ Operations Only
```bash
npm run test:farmer-read
```

#### UPDATE Operations Only
```bash
npm run test:farmer-update
```

#### DELETE Operations Only
```bash
npm run test:farmer-delete
```

### Run with Custom Options

#### Headless Mode
```bash
set HEADLESS=true && npm run test:farmer
```

#### Specific Browser
```bash
set BROWSER=edge && npm run test:farmer
```

## 📊 Test Structure

```
farmer-crud-comprehensive.test.js
├── Setup & Login
├── Project Management - CREATE
│   ├── Navigate to Add Project
│   ├── Create New Project
│   └── Verify Project in List
├── Project Management - READ
│   ├── Display All Projects
│   ├── Search Projects
│   ├── View Project Details
│   └── Filter by Status
├── Project Management - UPDATE
│   ├── Navigate to Edit Page
│   ├── Update Project Details
│   └── Verify Updates
├── Project Management - DELETE
│   ├── Delete Project
│   └── Verify Deletion
├── Land Browsing - READ
│   ├── View Available Lands
│   ├── Filter by Price
│   └── View Land Details
├── Lease Management - READ
│   ├── View Accepted Leases
│   ├── View Active Leases
│   └── View Cancelled Leases
├── Profile Management - READ
│   └── View Profile Information
├── KYC Management - READ
│   ├── View KYC Status
│   └── Navigate to Verification
├── Dispute Management - READ
│   ├── View My Disputes
│   └── View Disputes Against Me
└── Dashboard - READ
    └── View Dashboard Statistics
```

## 🔍 Test Data

### Project Creation Data
```javascript
{
  title: "Selenium Test Project [timestamp]",
  description: "Automated test project with organic farming details",
  cropType: "Organic Tomatoes",
  fundingGoal: 75000,
  endDate: "[120 days from now]",
  
  // Farmer Verification
  aadhaarNumber: "123456789012",
  govtIdType: "AADHAAR",
  govtIdNumber: "123456789012",
  
  // Land Details
  state: "Karnataka",
  district: "Bangalore Rural",
  tehsil: "Devanahalli",
  village: "Chikkajala",
  panchayat: "Chikkajala Gram Panchayat",
  pincode: "562110",
  surveyNumber: "123/4A",
  landAreaValue: 2.5,
  landAreaUnit: "ACRE",
  landType: "AGRICULTURAL",
  latitude: 13.1986,
  longitude: 77.7066
}
```

## 📸 Screenshots

Screenshots are automatically captured on test failures and saved to:
```
tests/selenium/screenshots/
```

Naming convention: `farmer-[test-name]-failure-[timestamp].png`

## 🐛 Troubleshooting

### Common Issues

#### 1. Login Fails
**Problem**: Cannot login as farmer
**Solution**: 
- Verify farmer account exists in database
- Check credentials in `.env` file
- Ensure backend is running
- Verify email is verified (check `isVerified` field)

#### 2. Project Creation Fails
**Problem**: Cannot create new project
**Solution**:
- Check if all required fields are filled
- Verify file upload paths are correct
- Ensure farmer has necessary permissions
- Check backend logs for validation errors

#### 3. Element Not Found
**Problem**: Selenium cannot find elements
**Solution**:
- Increase `EXPLICIT_WAIT` in `.env`
- Check if frontend structure has changed
- Verify page has fully loaded
- Update locators in `pages/farmer-page.js`

#### 4. Tests Timeout
**Problem**: Tests exceed timeout limit
**Solution**:
- Increase timeout in test file: `this.timeout(300000)`
- Check network speed
- Verify servers are responsive
- Run in non-headless mode to debug

#### 5. Navigation Issues
**Problem**: Cannot navigate to specific pages
**Solution**:
- Verify routes in `frontend/src/App.tsx`
- Check if farmer is properly authenticated
- Ensure role-based access is working
- Clear browser cache/cookies

### Debug Mode

Run tests in debug mode with visible browser:
```bash
set HEADLESS=false
set IMPLICIT_WAIT=15000
set EXPLICIT_WAIT=30000
npm run test:farmer
```

### Check Server Status

Before running tests:
```bash
npm run check-servers
```

## 📈 Expected Results

### Successful Test Run Output
```
🚀 Starting Farmer CRUD Test Suite...
📋 Test Configuration:
   Base URL: http://localhost:5173
   Farmer Email: farmer@test.com
   Browser: chrome
   Headless: false

🔐 Logging in as farmer...
✅ Login successful

📝 Test: Navigate to Add Project page
✅ Successfully navigated to Add Project page

📝 Test: Create new project
   Step 1: Filling basic information...
   Step 2: Filling farmer verification...
   Step 3: Filling land details...
   Step 4: Submitting form...
✅ Project created successfully

[... more tests ...]

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

  40 passing (3m 25s)
```

## 🔧 Customization

### Adding New Tests

1. Open `farmer-crud-comprehensive.test.js`
2. Add new `describe` block:
```javascript
describe('New Feature - CRUD', function() {
  it('should perform new operation', async function() {
    console.log('\n📝 Test: New operation');
    
    // Your test code here
    
    console.log('✅ Operation successful');
  });
});
```

### Updating Page Objects

Edit `tests/selenium/pages/farmer-page.js` to add new locators:
```javascript
this.newElement = By.css('selector-here');
```

Add new methods:
```javascript
async performNewAction() {
  await this.helpers.clickElement(this.newElement);
  await this.driver.sleep(1000);
}
```

## 📝 Test Coverage

| Feature | CREATE | READ | UPDATE | DELETE |
|---------|--------|------|--------|--------|
| Projects | ✅ | ✅ | ✅ | ✅ |
| Lands | ❌ | ✅ | ❌ | ❌ |
| Leases | ✅* | ✅ | ❌ | ❌ |
| Profile | ❌ | ✅ | ✅* | ❌ |
| KYC | ✅* | ✅ | ❌ | ❌ |
| Disputes | ✅* | ✅ | ❌ | ❌ |

*Note: Some operations require specific conditions or are tested through related features

## 🎯 Best Practices

1. **Always run servers before tests**
   ```bash
   npm run check-servers
   ```

2. **Use unique test data**
   - Tests generate unique project titles with timestamps
   - Prevents conflicts with existing data

3. **Clean up after tests**
   - Tests automatically delete created projects
   - Verify cleanup in after hooks

4. **Handle async operations**
   - Use proper waits for elements
   - Add sleep delays for animations

5. **Take screenshots on failure**
   - Automatically enabled
   - Helps debug issues

## 📞 Support

For issues or questions:
1. Check troubleshooting section above
2. Review test logs and screenshots
3. Verify backend/frontend are running
4. Check browser console for errors
5. Review backend logs for API errors

## 🔄 Continuous Integration

### GitHub Actions Example
```yaml
name: Farmer Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: |
          cd tests/selenium
          npm install
      - name: Run tests
        run: |
          cd tests/selenium
          npm run test:farmer
        env:
          HEADLESS: true
          FARMER_EMAIL: ${{ secrets.FARMER_EMAIL }}
          FARMER_PASSWORD: ${{ secrets.FARMER_PASSWORD }}
```

## 📚 Additional Resources

- [Selenium WebDriver Documentation](https://www.selenium.dev/documentation/)
- [Mocha Test Framework](https://mochajs.org/)
- [Chai Assertion Library](https://www.chaijs.com/)
- [Page Object Model Pattern](https://www.selenium.dev/documentation/test_practices/encouraged/page_object_models/)

---

**Last Updated**: February 2026
**Version**: 1.0.0
**Maintainer**: AgriCorus QA Team
