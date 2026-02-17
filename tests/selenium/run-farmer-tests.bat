@echo off
echo ========================================
echo   AgriCorus Farmer CRUD Test Suite
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [ERROR] Dependencies not installed!
    echo Please run: npm install
    echo.
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist ".env" (
    echo [WARNING] .env file not found!
    echo Copying from .env.example...
    copy .env.example .env
    echo.
    echo [ACTION REQUIRED] Please update .env with your test credentials
    echo Then run this script again.
    echo.
    pause
    exit /b 1
)

echo [1/3] Checking if servers are running...
node check-servers.js
if errorlevel 1 (
    echo.
    echo [ERROR] Servers are not running!
    echo Please start:
    echo   - Backend: http://localhost:5000
    echo   - Frontend: http://localhost:5173
    echo.
    pause
    exit /b 1
)

echo.
echo [2/3] Starting Farmer CRUD Tests...
echo.
echo Select test suite to run:
echo   1. All Farmer Tests (Comprehensive)
echo   2. Project Management Tests Only
echo   3. Land Browsing Tests Only
echo   4. Lease Management Tests Only
echo   5. CREATE Operations Only
echo   6. READ Operations Only
echo   7. UPDATE Operations Only
echo   8. DELETE Operations Only
echo.
set /p choice="Enter your choice (1-8): "

if "%choice%"=="1" (
    echo.
    echo Running: All Farmer Tests
    npm run test:farmer
) else if "%choice%"=="2" (
    echo.
    echo Running: Project Management Tests
    npm run test:farmer-projects
) else if "%choice%"=="3" (
    echo.
    echo Running: Land Browsing Tests
    npm run test:farmer-lands
) else if "%choice%"=="4" (
    echo.
    echo Running: Lease Management Tests
    npm run test:farmer-leases
) else if "%choice%"=="5" (
    echo.
    echo Running: CREATE Operations
    npm run test:farmer-create
) else if "%choice%"=="6" (
    echo.
    echo Running: READ Operations
    npm run test:farmer-read
) else if "%choice%"=="7" (
    echo.
    echo Running: UPDATE Operations
    npm run test:farmer-update
) else if "%choice%"=="8" (
    echo.
    echo Running: DELETE Operations
    npm run test:farmer-delete
) else (
    echo.
    echo [ERROR] Invalid choice!
    pause
    exit /b 1
)

echo.
echo [3/3] Test execution completed!
echo.
echo Screenshots saved to: screenshots\
echo.
pause
