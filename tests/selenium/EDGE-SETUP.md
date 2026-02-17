# Microsoft Edge WebDriver Setup

Your system has Microsoft Edge but not Google Chrome. The tests have been configured to use Edge instead.

## Quick Test

Try running the tests now - Edge may have a built-in WebDriver:

```bash
npm run test:landowner
```

## If Tests Fail with "SessionNotCreatedError"

You need to download the Edge WebDriver manually:

### Step 1: Check Your Edge Version

1. Open Microsoft Edge
2. Click the three dots (...) in the top right
3. Go to Help and feedback > About Microsoft Edge
4. Note the version number (e.g., 131.0.2903.86)

### Step 2: Download Matching WebDriver

1. Go to: https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/
2. Download the WebDriver that matches your Edge version
3. Extract the `msedgedriver.exe` file

### Step 3: Place WebDriver

Put `msedgedriver.exe` in one of these locations:

- `C:\Program Files (x86)\Microsoft\Edge\Application\`
- Or add it to your system PATH

### Step 4: Run Tests

```bash
npm run test:landowner
```

## Alternative: Install Google Chrome

If you prefer to use Chrome instead:

1. Install Chrome: https://www.google.com/chrome/
2. Run: `npm run setup-browser`
3. Run tests: `npm test`

## Troubleshooting

If you still have issues:

1. Make sure Edge is updated to the latest version
2. Restart your terminal after installing WebDriver
3. Try running in headless mode: Set `HEADLESS=true` in `.env`
4. Check the TROUBLESHOOTING.md file for more help
