@echo off
echo ========================================
echo Landowner CRUD Selenium Tests
echo ========================================
echo.

REM Check if .env exists
if not exist .env (
    echo ❌ ERROR: .env file not found!
    echo.
    echo Please create .env file with your test credentials:
    echo 1. Copy .env.example to .env
    echo 2. Update LANDOWNER_EMAIL and LANDOWNER_PASSWORD
    echo.
    pause
    exit /b 1
)

echo ✅ Environment file found
echo.

REM Check if node_modules exists
if not exist node_modules (
    echo 📦 Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed
    echo.
)

echo 🚀 Starting tests...
echo.
echo ⚠️  IMPORTANT: Make sure you have:
echo    1. Backend server running on http://localhost:5000
echo    2. Frontend server running on http://localhost:5173
echo    3. Valid landowner credentials in .env file
echo.
echo Press Ctrl+C to cancel, or
pause

echo.
echo 🧪 Running Landowner CRUD Tests...
echo.

call npm test

echo.
echo ========================================
echo Test execution completed!
echo ========================================
echo.
echo 📊 View detailed report:
echo    Open reports\report.html in your browser
echo.
echo 📸 Screenshots (if any failures):
echo    Check screenshots\ directory
echo.
pause
