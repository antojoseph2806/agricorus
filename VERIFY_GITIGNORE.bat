@echo off
echo ========================================
echo Verifying .gitignore Configuration
echo ========================================
echo.

echo Checking if sensitive files are ignored...
echo.

echo [1/5] Checking backend/.env...
git check-ignore backend/.env >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ backend/.env is IGNORED
) else (
    echo ✗ WARNING: backend/.env is NOT ignored!
)

echo [2/5] Checking frontend/.env...
git check-ignore frontend/.env >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ frontend/.env is IGNORED
) else (
    echo ✗ WARNING: frontend/.env is NOT ignored!
)

echo [3/5] Checking backend/node_modules...
git check-ignore backend/node_modules >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ backend/node_modules is IGNORED
) else (
    echo ✗ WARNING: backend/node_modules is NOT ignored!
)

echo [4/5] Checking frontend/node_modules...
git check-ignore frontend/node_modules >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ frontend/node_modules is IGNORED
) else (
    echo ✗ WARNING: frontend/node_modules is NOT ignored!
)

echo [5/5] Checking backend/service-account.json...
git check-ignore backend/service-account.json >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ backend/service-account.json is IGNORED
) else (
    echo ✗ WARNING: backend/service-account.json is NOT ignored!
)

echo.
echo ========================================
echo Checking what files are tracked...
echo ========================================
echo.

echo Searching for .env files in Git...
git ls-files | findstr /i "\.env$" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✗ WARNING: .env files found in Git!
    git ls-files | findstr /i "\.env$"
) else (
    echo ✓ No .env files tracked
)

echo.
echo Searching for node_modules in Git...
git ls-files | findstr /i "node_modules" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✗ WARNING: node_modules found in Git!
    echo Run CLEAN_GIT_REPO.bat to remove them
) else (
    echo ✓ No node_modules tracked
)

echo.
echo Searching for service-account.json in Git...
git ls-files | findstr /i "service-account.json" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✗ WARNING: service-account.json found in Git!
    echo Run CLEAN_GIT_REPO.bat to remove it
) else (
    echo ✓ No service-account.json tracked
)

echo.
echo ========================================
echo Verification Complete!
echo ========================================
echo.
echo If you see any warnings above, run:
echo   CLEAN_GIT_REPO.bat
echo.
pause
