#!/bin/bash

# Landowner CRUD Selenium Tests - Setup Script
# This script automates the setup process

echo "🚀 Setting up Landowner CRUD Selenium Tests..."
echo ""

# Check Node.js installation
echo "📦 Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v14 or higher."
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js $NODE_VERSION found"
echo ""

# Check npm installation
echo "📦 Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

NPM_VERSION=$(npm -v)
echo "✅ npm $NPM_VERSION found"
echo ""

# Install dependencies
echo "📥 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed successfully"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created"
    echo "⚠️  Please update .env with your test credentials"
else
    echo "✅ .env file already exists"
fi
echo ""

# Create directories
echo "📁 Creating required directories..."
mkdir -p screenshots
mkdir -p reports
echo "✅ Directories created"
echo ""

# Check Chrome installation
echo "🌐 Checking Chrome installation..."
if command -v google-chrome &> /dev/null; then
    CHROME_VERSION=$(google-chrome --version)
    echo "✅ $CHROME_VERSION found"
elif command -v chrome &> /dev/null; then
    CHROME_VERSION=$(chrome --version)
    echo "✅ $CHROME_VERSION found"
elif command -v chromium &> /dev/null; then
    CHROME_VERSION=$(chromium --version)
    echo "✅ $CHROME_VERSION found"
else
    echo "⚠️  Chrome not found. Please install Google Chrome."
fi
echo ""

# Display next steps
echo "✅ Setup completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Update .env file with your test credentials"
echo "2. Ensure backend server is running on http://localhost:5000"
echo "3. Ensure frontend server is running on http://localhost:5173"
echo "4. Run tests with: npm test"
echo ""
echo "📚 For more information, see:"
echo "   - README.md for detailed documentation"
echo "   - QUICKSTART.md for quick start guide"
echo ""
echo "🎉 Happy Testing!"
