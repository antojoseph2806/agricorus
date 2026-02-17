# 🌾 Complete Farmer CRUD Test Suite Guide

## 📖 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Running Tests](#running-tests)
6. [Test Coverage](#test-coverage)
7. [Understanding the Tests](#understanding-the-tests)
8. [Troubleshooting](#troubleshooting)
9. [Advanced Usage](#advanced-usage)
10. [Maintenance](#maintenance)

---

## 🎯 Overview

This is a comprehensive Selenium WebDriver test suite that validates all CRUD (Create, Read, Update, Delete) operations available to farmers in the AgriCorus agricultural platform.

### What's Tested?

✅ **Project Management** - Full CRUD operations  
✅ **Land Browsing** - View and filter available lands  
✅ **Lease Management** - Track lease status  
✅ **Profile Management** - View farmer profile  
✅ **KYC Management** - Check verification status  
✅ **Dispute Management** - View disputes  
✅ **Dashboard** - View statistics and metrics  

### Test Statistics

- **Total Tests**: 40+
- **Execution Time**: 3-4 minutes
- **Pass Rate Target**: 95%+
- **Automation Level**: 100%

---

## 🚀 Quick Start

### 1. Prerequisites

Ensure you have:
- Node.js v14+ installed
- Chrome or Edge browser
- Backend server running on port 5000
- Frontend server running on port 5173

### 2. Install

```bash
cd tests/selenium
npm install
```

### 3. Configure

```bash
# Copy environment file
copy .env.example .env

# Edit with your credentials
notepad .env
```

### 4. Run

```bash
# Windows
run-farmer-tests.bat

# Or directly
npm run test:farmer
```

---

## 📦 Installation

### Step-by-Step Installation

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd agricorus
   ```

2. **Navigate to Test Directory**
   ```bash
   cd tests/selenium
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Verify Installation**
   ```bash
   npm list
   ```

### Dependencies Installed

- `selenium-webdriver` - Browser automation
- `chromedriver` - Chrome browser driver
- `mocha` - Test framework
- `chai` - Assertion library
- `faker` - Test data generation
- `dotenv` - Environment configuration

---

## ⚙️ Configuration

### Environment Variables

Create `.env` file with:

```env
# Server URLs
BASE_URL=http://localhost:5173
API_BASE_URL=http://localhost:5000/api

# Farmer Test Credentials
FARMER_EMAIL=farmer@test.com
FARMER_PASSWORD=Test@123
FARMER_NAME=Test Farmer
FARMER_PHONE=9876543211

# Browser Configuration
BROWSER=chrome          # or 'edge'
HEADLESS=false         # true for CI/CD
IMPLICIT_WAIT=10000    # milliseconds
EXPLICIT_WAIT=20000    # milliseconds

# Screenshot Configuration
SCREENSHOT_ON_FAILURE=true
SCREENSHOT_DIR=./screenshots
```

### Creating Test User

Ensure farmer account exists in database:

```javascript
{
  email: "farmer@test.com",
  password: "Test@123", // hashed
  name: "Test Farmer",
  phone: "9876543211",
  role: "farmer",
  isVerified: true,
  isBlocked: false
}
```

---

## 🧪 Running Tests

### All Tests

```bash
npm run test:farmer
```

### By Feature

```bash
# Project management only
npm run test:farmer-projects

# Land browsing only
npm run test:farmer-lands

# Lease management only
npm run test:farmer-leases
```

### By Operation

```bash
# CREATE operations
npm run test:farmer-create

# READ operations
npm run test:farmer-read

# UPDATE operations
npm run test:farmer-update

# DELETE operations
npm run test:farmer-delete
```

### Interactive Mode (Windows)

```bash
run-farmer-tests.bat
```

This provides a menu to select which tests to run.

### Debug Mode

```bash
# Run with visible browser
set HEADLESS=false
npm run test:farmer

# With increased timeouts
set EXPLICIT_WAIT=30000
npm run test:farmer
```

---

## 📊 Test Coverage

### Project Management (Full CRUD)

#### CREATE
- Navigate to add project page
- Fill multi-step form:
  - Basic info (title, description, crop, funding, date)
  - Farmer verification (Aadhaar, govt ID)
  - Land details (location, area, coordinates)
- Submit and verify creation

#### READ
- Display all projects
- Search by title
- Filter by status
- Filter by verification status
- View project details

#### UPDATE
- Navigate to edit page
- Update project title
- Update funding goal
- Verify changes

#### DELETE
- Delete project with confirmation
- Verify removal from list

### Land Browsing (READ)

- View available lands
- Filter by price range
- Filter by soil type
- View land details

### Lease Management (READ)

- View accepted leases
- View active leases
- View cancelled leases

### Profile Management (READ)

- Navigate to profile
- Display profile information

### KYC Management (READ)

- View KYC status
- Navigate to verification page

### Dispute Management (READ)

- View my disputes
- View disputes against me

### Dashboard (READ)

- Navigate to dashboard
- Display statistics

---

## 🔍 Understanding the Tests

### Test Structure

```javascript
describe('Feature - Operation', function() {
  it('should perform specific action', async function() {
    // Arrange: Setup test data
    const testData = generateTestData();
    
    // Act: Perform action
    await farmerPage.performAction(testData);
    
    // Assert: Verify result
    expect(result).to.be.true;
  });
});
```

### Page Object Model

Tests use Page Object Model pattern:

```
pages/
├── login-page.js      # Login functionality
└── farmer-page.js     # Farmer-specific pages
```

**Benefits:**
- Reusable code
- Easy maintenance
- Clear test structure
- Centralized locators

### Test Data Generation

Uses `faker.js` for realistic data:

```javascript
const FarmerTestData = require('./utils/farmer-test-data');

// Generate project data
const project = FarmerTestData.generateCompleteProject();

// Generate verification data
const kyc = FarmerTestData.generateKYCData();
```

### Helper Functions

Common operations abstracted:

```javascript
// Wait for element
await helpers.waitForElement(locator);

// Click element
await helpers.clickElement(locator);

// Type text
await helpers.typeText(locator, text);

// Take screenshot
await helpers.takeScreenshot('test-name');
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Login Fails

**Symptoms:**
- Cannot login as farmer
- Redirected back to login page
- Authentication error

**Solutions:**
```bash
# Check farmer account exists
mongo
use agricorus
db.users.findOne({ email: "farmer@test.com" })

# Verify account is verified
db.users.updateOne(
  { email: "farmer@test.com" },
  { $set: { isVerified: true, isBlocked: false } }
)
```

#### 2. Element Not Found

**Symptoms:**
- "Element not found" errors
- Tests timeout waiting for elements

**Solutions:**
```env
# Increase wait times in .env
EXPLICIT_WAIT=30000
IMPLICIT_WAIT=15000

# Run in non-headless mode to debug
HEADLESS=false
```

#### 3. Server Connection Failed

**Symptoms:**
- Cannot connect to backend/frontend
- Network errors

**Solutions:**
```bash
# Check servers are running
npm run check-servers

# Verify ports are not in use
netstat -ano | findstr :5000
netstat -ano | findstr :5173

# Start servers if needed
cd backend && npm start
cd frontend && npm run dev
```

#### 4. Tests Timeout

**Symptoms:**
- Tests exceed timeout limit
- Slow execution

**Solutions:**
```javascript
// Increase timeout in test file
this.timeout(300000); // 5 minutes

// Or in specific test
it('should do something', async function() {
  this.timeout(60000); // 1 minute
  // test code
});
```

#### 5. Browser Driver Issues

**Symptoms:**
- Cannot start browser
- Driver version mismatch

**Solutions:**
```bash
# Update ChromeDriver
npm install chromedriver@latest

# Or use Edge
set BROWSER=edge
npm install edgedriver
```

### Debug Checklist

When tests fail:

1. ✅ Check console output for errors
2. ✅ Review screenshots in `screenshots/` folder
3. ✅ Verify servers are running
4. ✅ Check test user credentials
5. ✅ Run in non-headless mode
6. ✅ Increase wait times
7. ✅ Check browser console for errors
8. ✅ Review backend logs

---

## 🎓 Advanced Usage

### Custom Test Data

Create custom test scenarios:

```javascript
const customProject = {
  title: "My Custom Project",
  description: "Custom description",
  cropType: "Custom Crop",
  fundingGoal: 100000,
  endDate: "2026-12-31"
};

await farmerPage.fillBasicInfo(customProject);
```

### Running Specific Tests

```bash
# Run single test by name
npx mocha farmer-crud-comprehensive.test.js --grep "should create a new project"

# Run tests matching pattern
npx mocha farmer-crud-comprehensive.test.js --grep "Project Management"
```

### Parallel Execution

For faster execution (advanced):

```bash
npm install mocha-parallel-tests

# Run tests in parallel
npx mocha-parallel-tests farmer-crud-comprehensive.test.js
```

### CI/CD Integration

#### GitHub Actions

```yaml
name: Farmer Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:latest
        ports:
          - 27017:27017
    
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
      
      - name: Start backend
        run: |
          cd backend
          npm install
          npm start &
          sleep 10
      
      - name: Start frontend
        run: |
          cd frontend
          npm install
          npm run build
          npm run preview &
          sleep 10
      
      - name: Run tests
        run: |
          cd tests/selenium
          npm run test:farmer
        env:
          HEADLESS: true
          FARMER_EMAIL: ${{ secrets.FARMER_EMAIL }}
          FARMER_PASSWORD: ${{ secrets.FARMER_PASSWORD }}
      
      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v2
        with:
          name: test-screenshots
          path: tests/selenium/screenshots/
```

### Custom Reporters

Generate HTML reports:

```bash
npm install mochawesome

# Run with reporter
npx mocha farmer-crud-comprehensive.test.js --reporter mochawesome
```

---

## 🔧 Maintenance

### Regular Updates

#### Weekly
- Run full test suite
- Review failures
- Update test data if needed

#### Monthly
- Update dependencies: `npm update`
- Review test coverage
- Optimize slow tests
- Update documentation

#### Before Deployment
- Run all tests
- Verify 100% pass rate
- Check execution time
- Review recent changes

### Updating Tests

When UI changes:

1. **Update Locators**
   ```javascript
   // In pages/farmer-page.js
   this.newElement = By.css('new-selector');
   ```

2. **Update Methods**
   ```javascript
   async performNewAction() {
     await this.helpers.clickElement(this.newElement);
   }
   ```

3. **Add New Tests**
   ```javascript
   it('should test new feature', async function() {
     // test code
   });
   ```

### Best Practices

1. **Keep Tests Independent**
   - Each test should run standalone
   - Don't rely on test execution order

2. **Use Meaningful Names**
   - Describe what the test does
   - Use "should" statements

3. **Clean Up After Tests**
   - Delete created test data
   - Reset state

4. **Handle Async Properly**
   - Always await async operations
   - Use proper wait strategies

5. **Document Changes**
   - Update comments
   - Update documentation
   - Note breaking changes

---

## 📚 Additional Resources

### Documentation Files

- `FARMER-README.md` - Quick reference
- `FARMER-TEST-GUIDE.md` - Comprehensive guide
- `FARMER-TEST-SUMMARY.md` - Test coverage summary
- `FARMER-TEST-CHECKLIST.md` - Pre-test checklist
- `FARMER-COMPLETE-GUIDE.md` - This file

### External Resources

- [Selenium WebDriver Docs](https://www.selenium.dev/documentation/)
- [Mocha Documentation](https://mochajs.org/)
- [Chai Assertions](https://www.chaijs.com/)
- [Faker.js](https://github.com/marak/Faker.js/)
- [Page Object Model](https://www.selenium.dev/documentation/test_practices/encouraged/page_object_models/)

### Code Examples

Check these files for examples:
- `farmer-crud-comprehensive.test.js` - Main test file
- `pages/farmer-page.js` - Page object implementation
- `utils/farmer-test-data.js` - Test data generation
- `utils/test-helpers.js` - Helper functions

---

## 🎉 Success!

You now have a complete understanding of the Farmer CRUD test suite!

### Next Steps

1. ✅ Complete the checklist in `FARMER-TEST-CHECKLIST.md`
2. ✅ Run your first test: `npm run test:farmer`
3. ✅ Review the results
4. ✅ Explore the code
5. ✅ Customize for your needs

### Getting Help

If you encounter issues:
1. Check the troubleshooting section above
2. Review error messages and screenshots
3. Consult the documentation files
4. Check backend/frontend logs
5. Run in debug mode

---

**Happy Testing! 🚀**

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Maintainer**: AgriCorus QA Team  
**License**: MIT
