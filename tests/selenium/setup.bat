@echo off
REM Landowner CRUD Selenium Tests - Setup Script for Windows
REM This script automates the setup process

echo 🚀 Setting up Landowner CRUD Selenium Tests...
echo.

REM Check Node.js installation
echo 📦 Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js v14 or higher.
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION% found
echo.

REM Check npm installation
echo 📦 Checking npm installation...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm is not installed. Please install npm.
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo ✅ npm %NPM_VERSION% found
echo.

REM Install dependencies
echo 📥 Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install dependencies
    exit /b 1
)
echo ✅ Dependencies installed successfully
echo.

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file from .env.example...
    copy .env.example .env >nul
    echo ✅ .env file created
    echo ⚠️  Please update .env with your test credentials
) else (
    echo ✅ .env file already exists
)
echo.

REM Create directories
echo 📁 Creating required directories...
if not exist screenshots mkdir screenshots
if not exist reports mkdir reports
echo ✅ Directories created
echo.

REM Check Chrome installation
echo 🌐 Checking Chrome installation...
where chrome >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Chrome found
) else (
    echo ⚠️  Chrome not found. Please install Google Chrome.
)
echo.

REM Display next steps
echo ✅ Setup completed successfully!
echo.
echo 📋 Next Steps:
echo 1. Update .env file with your test credentials
echo 2. Ensure backend server is running on http://localhost:5000
echo 3. Ensure frontend server is running on http://localhost:5173
echo 4. Run tests with: npm test
echo.
echo 📚 For more information, see:
echo    - README.md for detailed documentation
echo    - QUICKSTART.md for quick start guide
echo.
echo 🎉 Happy Testing!
pause
