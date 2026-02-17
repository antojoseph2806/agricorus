# Quick Start Guide - Selenium Tests

## ✅ Your Setup

Your tests are configured to use **Microsoft Edge** (Chrome not detected).

## Prerequisites

1. ✅ Node.js installed
2. ✅ Microsoft Edge installed  
3. Frontend server running on `http://localhost:5173`
4. Backend server running on `http://localhost:5000`

## Setup

1. Install dependencies:
```bash
cd tests/selenium
npm install
```

2. Configure test credentials in `.env`:
```env
LANDOWNER_EMAIL=your-test-user@example.com
LANDOWNER_PASSWORD=YourPassword123
```

## Running Tests

### Check if servers are running:
```bash
npm run check-servers
```

### Run all tests:
```bash
npm test
```

### Run specific test suite:
```bash
npm run test:landowner
```

### Run specific test category:
```bash
# Create operations only
npm run test:landowner-create

# Read operations only
npm run test:landowner-read

# Update operations only
npm run test:landowner-update

# Delete operations only
npm run test:landowner-delete
```

## Current Status

✅ **WebDriver timeout issue RESOLVED!**
- Edge WebDriver is working correctly
- Tests are running successfully
- Login is working

⚠️ **Next Steps:**
- Some tests are failing because UI elements aren't found
- This means the page selectors need to be updated to match your actual UI
- Check the screenshots in `./screenshots/` folder to see what the tests are seeing
- Update the selectors in `pages/landowner-page.js` to match your actual HTML

## Troubleshooting

If you get timeout errors:

1. **Ensure servers are running:**
   ```bash
   npm run check-servers
   ```

2. **Increase timeout in .env:**
   ```env
   IMPLICIT_WAIT=15000
   EXPLICIT_WAIT=40000
   ```

3. **Run in visible mode (not headless):**
   ```env
   HEADLESS=false
   ```

For more detailed troubleshooting, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## Test Results

- Screenshots of failed tests: `./screenshots/`
- Console logs show test progress in real-time

## Tips

- Run tests with `HEADLESS=false` to see browser actions
- Use specific test commands to run faster
- Ensure test user exists in database before running
- Clear test data periodically to avoid conflicts
- Check screenshots to debug element locator issues
