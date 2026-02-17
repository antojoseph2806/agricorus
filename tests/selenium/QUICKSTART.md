# Quick Start Guide - Landowner CRUD Selenium Tests

## 🚀 Quick Setup (5 minutes)

### Step 1: Prerequisites Check
Ensure you have:
- ✅ Node.js installed (v14+)
- ✅ Chrome browser installed
- ✅ Backend server running on port 5000
- ✅ Frontend server running on port 5173

### Step 2: Install Dependencies
```bash
cd tests/selenium
npm install
```

### Step 3: Configure Environment
```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your credentials
# Use any text editor to update:
# - LANDOWNER_EMAIL
# - LANDOWNER_PASSWORD
```

### Step 4: Run Tests
```bash
# Run all tests
npm test

# Or run specific test suite
npm run test:landowner
```

## 📊 Expected Output

```
Landowner CRUD Operations - Complete Test Suite
  Authentication
    ✓ should successfully login as landowner (3245ms)
    ✓ should navigate to My Lands page (1523ms)
  
  Create Land Listing (CREATE)
    ✓ should display Add Land button (892ms)
    ✓ should open land creation form (1234ms)
    ✓ should successfully create a new land listing (4567ms)
    ✓ should validate required fields (2341ms)
    ...

  35 passing (2m 15s)
```

## 🎯 Test User Setup

### Option 1: Use Existing User
Update `.env` with existing landowner credentials:
```env
LANDOWNER_EMAIL=existing@landowner.com
LANDOWNER_PASSWORD=ExistingPassword123
```

### Option 2: Create New Test User
1. Register a new user through the frontend
2. Select "Landowner" role
3. Complete registration
4. Update `.env` with new credentials

### Option 3: Use Database Seeding
If your project has seed scripts:
```bash
cd backend
npm run seed:users
```

## 🔧 Troubleshooting

### Issue: ChromeDriver version mismatch
```bash
npm install chromedriver@latest --save-dev
```

### Issue: Tests timeout
Increase timeout in `.env`:
```env
IMPLICIT_WAIT=15000
EXPLICIT_WAIT=30000
```

### Issue: Login fails
1. Verify backend is running: `http://localhost:5000/api/health`
2. Verify frontend is running: `http://localhost:5173`
3. Check credentials in `.env`
4. Ensure user has "landowner" role in database

### Issue: Elements not found
Run in non-headless mode to debug:
```env
HEADLESS=false
```

## 📸 Screenshots

Failed tests automatically capture screenshots in `screenshots/` directory.

## 📈 View Test Report

After running tests:
```bash
npm run test:report
```

Open `reports/report.html` in your browser.

## 🎬 Running Specific Tests

```bash
# Only CREATE tests
npm run test:landowner-create

# Only READ tests
npm run test:landowner-read

# Only UPDATE tests
npm run test:landowner-update

# Only DELETE tests
npm run test:landowner-delete

# Advanced tests
mocha landowner-advanced.test.js --timeout 60000
```

## 🐛 Debug Mode

Run with visible browser:
```bash
HEADLESS=false npm test
```

Enable verbose logging:
```bash
DEBUG=true npm test
```

## ✅ Verification Checklist

Before running tests, verify:
- [ ] Backend server is running
- [ ] Frontend server is running
- [ ] Test user exists with landowner role
- [ ] Test user credentials are in `.env`
- [ ] Chrome browser is installed
- [ ] Node modules are installed

## 📞 Need Help?

Common commands:
```bash
# Check Node version
node --version

# Check npm version
npm --version

# Check Chrome version
google-chrome --version  # Linux
chrome --version         # Mac

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 🎉 Success Indicators

Tests are working correctly if you see:
- ✅ All tests passing (green checkmarks)
- ✅ No timeout errors
- ✅ Screenshots only for intentional failures
- ✅ HTML report generated successfully

## 📚 Next Steps

After successful test run:
1. Review test report in `reports/report.html`
2. Check screenshots for any failures
3. Customize test data in `config/test-config.js`
4. Add more test scenarios in `landowner-crud.test.js`
5. Run advanced tests: `mocha landowner-advanced.test.js`

## 🔄 Continuous Integration

To run in CI/CD:
```bash
# Headless mode with timeout
HEADLESS=true npm test -- --timeout 90000
```

## 💡 Tips

1. Run tests in headless mode for faster execution
2. Use specific test commands to debug individual features
3. Check screenshots immediately after failures
4. Keep test data unique using timestamps
5. Clean up test data after runs

## 🎓 Learning Resources

- Selenium WebDriver: https://www.selenium.dev/documentation/
- Mocha Test Framework: https://mochajs.org/
- Chai Assertions: https://www.chaijs.com/
- Page Object Pattern: https://www.selenium.dev/documentation/test_practices/encouraged/page_object_models/
