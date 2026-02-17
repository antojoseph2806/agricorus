# Test Execution Guide

## 🎬 Step-by-Step Execution Instructions

### Prerequisites Checklist

Before running tests, ensure:

- [ ] Node.js v14+ installed
- [ ] Chrome browser installed
- [ ] Backend server running on `http://localhost:5000`
- [ ] Frontend server running on `http://localhost:5173`
- [ ] Test user created with landowner role
- [ ] Test user credentials available

### Step 1: Initial Setup (First Time Only)

#### Windows Users:
```cmd
cd tests\selenium
setup.bat
```

#### Linux/Mac Users:
```bash
cd tests/selenium
chmod +x setup.sh
./setup.sh
```

#### Manual Setup:
```bash
cd tests/selenium
npm install
cp .env.example .env
```

### Step 2: Configure Environment

Edit `.env` file with your test credentials:

```env
# Server URLs
BASE_URL=http://localhost:5173
API_BASE_URL=http://localhost:5000/api

# Test User Credentials
LANDOWNER_EMAIL=your-landowner@test.com
LANDOWNER_PASSWORD=YourPassword123
LANDOWNER_NAME=Test Landowner
LANDOWNER_PHONE=9876543210

# Browser Configuration
BROWSER=chrome
HEADLESS=false          # Set to true for faster execution
IMPLICIT_WAIT=10000
EXPLICIT_WAIT=20000

# Screenshot Configuration
SCREENSHOT_ON_FAILURE=true
SCREENSHOT_DIR=./screenshots
```

### Step 3: Verify Server Status

#### Check Backend:
```bash
curl http://localhost:5000/api/health
# or visit in browser
```

#### Check Frontend:
```bash
curl http://localhost:5173
# or visit in browser
```

### Step 4: Run Tests

#### Option A: Run All Tests
```bash
npm test
```

**Expected Output:**
```
🚀 Starting Landowner CRUD Test Suite...

Landowner CRUD Operations - Complete Test Suite
  Authentication
    ✓ should successfully login as landowner (3245ms)
    ✓ should navigate to My Lands page (1523ms)
  
  Create Land Listing (CREATE)
    ✓ should display Add Land button (892ms)
    ✓ should open land creation form (1234ms)
    ...
  
  35 passing (2m 15s)
```

#### Option B: Run Specific Test Suites
```bash
# Only CREATE tests
npm run test:landowner-create

# Only READ tests
npm run test:landowner-read

# Only UPDATE tests
npm run test:landowner-update

# Only DELETE tests
npm run test:landowner-delete

# All landowner tests
npm run test:landowner
```

#### Option C: Run Advanced Tests
```bash
mocha landowner-advanced.test.js --timeout 60000
```

#### Option D: Run with Custom Options
```bash
# Headless mode
HEADLESS=true npm test

# Increased timeout
npm test -- --timeout 90000

# Specific test pattern
npm test -- --grep "Create"
```

### Step 5: View Test Results

#### Console Output
Test results are displayed in the console with:
- ✓ Green checkmarks for passed tests
- ✗ Red X for failed tests
- Test duration for each test
- Total execution time

#### HTML Report
```bash
# Generate HTML report
npm run test:report

# Open report (Windows)
start reports\report.html

# Open report (Mac)
open reports/report.html

# Open report (Linux)
xdg-open reports/report.html
```

#### Screenshots
Failed test screenshots are saved in `screenshots/` directory:
```
screenshots/
├── failed-create-land-1234567890.png
├── failed-update-land-1234567891.png
└── ...
```

### Step 6: Analyze Results

#### Successful Test Run
```
✅ All tests passing
✅ No errors in console
✅ No screenshots generated (unless intentional)
✅ HTML report shows 100% pass rate
```

#### Failed Test Run
```
❌ Some tests failing
❌ Error messages in console
❌ Screenshots in screenshots/ directory
❌ HTML report shows failures with details
```

## 🔍 Debugging Failed Tests

### Step 1: Check Error Message
```
1) Create Land Listing (CREATE)
   should successfully create a new land listing:
   Error: Element not found: input[name="title"]
   at LandownerPage.fillLandForm (pages/landowner-page.js:45:12)
```

### Step 2: View Screenshot
Open the screenshot from `screenshots/` directory to see the UI state when the test failed.

### Step 3: Run in Non-Headless Mode
```bash
# Update .env
HEADLESS=false

# Run specific test
npm test -- --grep "create a new land"
```

### Step 4: Add Debug Logging
Temporarily add console.log statements:
```javascript
console.log('Current URL:', await helpers.getCurrentUrl());
console.log('Element exists:', await helpers.elementExists(locator));
```

### Step 5: Increase Timeouts
```bash
# Update .env
EXPLICIT_WAIT=30000

# Or run with timeout flag
npm test -- --timeout 90000
```

## 📊 Test Execution Scenarios

### Scenario 1: Quick Smoke Test
**Purpose**: Verify basic functionality
**Duration**: ~30 seconds
```bash
npm test -- --grep "Authentication"
```

### Scenario 2: Full CRUD Test
**Purpose**: Test all CRUD operations
**Duration**: ~2 minutes
```bash
npm run test:landowner
```

### Scenario 3: Regression Test
**Purpose**: Test after code changes
**Duration**: ~3 minutes
```bash
npm test
```

### Scenario 4: Edge Case Testing
**Purpose**: Test boundary conditions
**Duration**: ~2 minutes
```bash
npm test -- --grep "Edge Cases"
```

### Scenario 5: Performance Test
**Purpose**: Test with multiple operations
**Duration**: ~3 minutes
```bash
mocha landowner-advanced.test.js --timeout 60000
```

## 🎯 Test Execution Best Practices

### Before Running Tests
1. ✅ Close unnecessary browser windows
2. ✅ Ensure stable internet connection
3. ✅ Verify servers are running
4. ✅ Check test user credentials
5. ✅ Clear previous test data (optional)

### During Test Execution
1. ✅ Don't interact with the browser
2. ✅ Don't close terminal/command prompt
3. ✅ Monitor console output
4. ✅ Note any error messages
5. ✅ Let tests complete fully

### After Test Execution
1. ✅ Review test results
2. ✅ Check HTML report
3. ✅ Analyze failed tests
4. ✅ Review screenshots
5. ✅ Clean up test data (if needed)

## 🔄 Continuous Integration Setup

### GitHub Actions Example
```yaml
name: Landowner Tests

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
        env:
          HEADLESS: true
          LANDOWNER_EMAIL: ${{ secrets.LANDOWNER_EMAIL }}
          LANDOWNER_PASSWORD: ${{ secrets.LANDOWNER_PASSWORD }}
        run: |
          cd tests/selenium
          npm test
      
      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v2
        with:
          name: test-screenshots
          path: tests/selenium/screenshots/
      
      - name: Upload report
        uses: actions/upload-artifact@v2
        with:
          name: test-report
          path: tests/selenium/reports/
```

## 📈 Performance Optimization

### Faster Test Execution
```bash
# Run in headless mode
HEADLESS=true npm test

# Run tests in parallel (if supported)
npm test -- --parallel

# Run specific tests only
npm test -- --grep "smoke"
```

### Reduce Flakiness
```env
# Increase wait times
IMPLICIT_WAIT=15000
EXPLICIT_WAIT=30000

# Disable animations (if possible)
# Add to test-config.js
```

## 🛠️ Troubleshooting Common Issues

### Issue 1: ChromeDriver Not Found
```bash
# Solution
npm install chromedriver@latest
```

### Issue 2: Port Already in Use
```bash
# Check what's using the port
netstat -ano | findstr :5173  # Windows
lsof -i :5173                 # Mac/Linux

# Kill the process or use different port
```

### Issue 3: Login Fails
```bash
# Verify user exists
# Check database or create user through UI
# Verify credentials in .env
```

### Issue 4: Tests Timeout
```bash
# Increase timeout
npm test -- --timeout 90000

# Or update .env
EXPLICIT_WAIT=30000
```

### Issue 5: Element Not Found
```bash
# Run in non-headless mode to see UI
HEADLESS=false npm test

# Check if selectors need updating
# Review page object files
```

## 📝 Test Execution Checklist

### Pre-Execution
- [ ] Servers running
- [ ] Dependencies installed
- [ ] Environment configured
- [ ] Test user exists
- [ ] Browser installed

### Execution
- [ ] Tests started
- [ ] No errors in console
- [ ] Tests progressing
- [ ] Screenshots captured (if failures)
- [ ] Tests completed

### Post-Execution
- [ ] Results reviewed
- [ ] Report generated
- [ ] Failures analyzed
- [ ] Screenshots checked
- [ ] Issues documented

## 🎓 Learning Resources

### Understanding Test Output
- Green ✓ = Test passed
- Red ✗ = Test failed
- Yellow - = Test skipped
- (time) = Execution duration

### Reading Error Messages
```
Error: Timeout waiting for element
  at TestHelpers.waitForElement (utils/test-helpers.js:15)
  at LandownerPage.clickAddLand (pages/landowner-page.js:45)
  at Context.<anonymous> (landowner-crud.test.js:78)
```

**Interpretation:**
- Error type: Timeout
- Location: test-helpers.js line 15
- Called from: landowner-page.js line 45
- Test file: landowner-crud.test.js line 78

## 🏆 Success Indicators

Your tests are running successfully if you see:
- ✅ All tests passing
- ✅ Execution time reasonable (2-3 minutes)
- ✅ No timeout errors
- ✅ No element not found errors
- ✅ Clean console output
- ✅ HTML report generated
- ✅ No unexpected screenshots

## 📞 Getting Help

If you encounter issues:
1. Check this guide
2. Review README.md
3. Check QUICKSTART.md
4. Review error messages
5. Check screenshots
6. Verify configuration
7. Check server logs

---

**Happy Testing! 🎉**

For more information, see:
- README.md - Full documentation
- QUICKSTART.md - Quick start guide
- TEST-COVERAGE.md - Coverage details
- IMPLEMENTATION-SUMMARY.md - Project overview
