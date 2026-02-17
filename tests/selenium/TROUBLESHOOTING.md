# Selenium Test Troubleshooting Guide

## Common Issues and Solutions

### 1. Timeout Errors

**Error:** `Error: Timeout of 120000ms exceeded`

**Solutions:**
- Increased test timeout to 180000ms (3 minutes) in package.json and test files
- Ensure your application server is running at `http://localhost:5173`
- Ensure your API server is running at `http://localhost:5000`
- Check if ChromeDriver is compatible with your Chrome version

**Quick Fix:**
```bash
# Make sure both servers are running before tests
# Terminal 1 - Frontend
cd frontend
npm run dev

# Terminal 2 - Backend
cd backend
npm start

# Terminal 3 - Tests
cd tests/selenium
npm test
```

### 2. WebDriver Initialization Fails

**Error:** `Failed to create driver`

**Solutions:**
- Update ChromeDriver: `npm install chromedriver@latest`
- Check Chrome browser version matches ChromeDriver
- Try running in headless mode: Set `HEADLESS=true` in `.env`

### 3. Element Not Found

**Error:** `Element not found` or `NoSuchElementError`

**Solutions:**
- Increase wait times in `.env`:
  ```
  IMPLICIT_WAIT=15000
  EXPLICIT_WAIT=30000
  ```
- Check if the application UI has changed
- Run tests with `HEADLESS=false` to see what's happening

### 4. Login Fails

**Error:** Tests fail at authentication step

**Solutions:**
- Verify credentials in `.env` file are correct
- Ensure the test user exists in the database
- Check if the login page URL is correct in `test-config.js`

### 5. Slow Test Execution

**Solutions:**
- Run in headless mode: `HEADLESS=true`
- Reduce `driver.sleep()` calls (already optimized)
- Run specific test suites instead of all tests:
  ```bash
  npm run test:landowner-create
  npm run test:landowner-read
  ```

## Pre-Test Checklist

Before running tests, ensure:

- [ ] Frontend server is running (`http://localhost:5173`)
- [ ] Backend server is running (`http://localhost:5000`)
- [ ] Test user credentials are correct in `.env`
- [ ] Chrome browser is installed
- [ ] ChromeDriver is installed (`npm install`)
- [ ] Database is accessible and has test data

## Running Tests

### Run all tests
```bash
npm test
```

### Run specific test suite
```bash
npm run test:landowner
```

### Run specific test category
```bash
npm run test:landowner-create
npm run test:landowner-read
npm run test:landowner-update
npm run test:landowner-delete
```

### Debug mode (non-headless)
Set in `.env`:
```
HEADLESS=false
```

## Timeout Configuration

Current timeout settings:
- Mocha global timeout: 180000ms (3 minutes)
- Test suite timeout: 180000ms
- Before hook timeout: 180000ms
- Implicit wait: 10000ms
- Explicit wait: 30000ms
- Page load timeout: 60000ms

## Getting Help

If issues persist:
1. Check screenshots in `./screenshots` folder
2. Review console logs for error details
3. Verify application is working manually in browser
4. Check network connectivity
5. Ensure no firewall blocking localhost connections

## Performance Tips

1. Use headless mode for faster execution
2. Run tests in parallel (requires test isolation)
3. Mock external API calls if possible
4. Use test database with minimal data
5. Clear browser cache between test runs
