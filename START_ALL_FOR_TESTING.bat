@echo off
echo ========================================
echo STARTING AGRICORUS FOR TESTING
echo ========================================
echo.

echo This will open 3 terminal windows:
echo 1. Backend Server (port 5000)
echo 2. Frontend Server (port 5173)
echo 3. Test Runner
echo.
echo Press any key to continue...
pause >nul

echo.
echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm start"

echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo Waiting 10 seconds for frontend to start...
timeout /t 10 /nobreak >nul

echo.
echo Opening Test Terminal...
echo You can run tests with: npm test
start "Test Runner" cmd /k "cd tests\e2e && echo Ready to run tests! && echo Type: npm test && echo."

echo.
echo ========================================
echo ALL SERVERS STARTED!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo In the "Test Runner" window, type: npm test
echo.
echo Press any key to exit this window...
pause >nul
