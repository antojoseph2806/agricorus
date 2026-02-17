#!/bin/bash

# Plant Disease Identification ML Service Startup Script

echo "🌱 Starting Plant Disease Identification ML Service..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✓ Python found: $(python3 --version)"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✓ Virtual environment created"
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install/upgrade dependencies
echo "📥 Installing dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt

# Check if model file exists
if [ ! -f "plant_disease_model.h5" ] && [ ! -f "plant_disease_model.keras" ]; then
    echo "⚠️  Warning: Model file not found!"
    echo "   Please ensure plant_disease_model.h5 or plant_disease_model.keras exists"
    echo ""
fi

# Check if treatment data exists
if [ ! -f "treatment_data.json" ]; then
    echo "❌ Error: treatment_data.json not found!"
    exit 1
fi

echo ""
echo "✓ All dependencies installed"
echo ""
echo "🚀 Starting ML service on http://localhost:8000"
echo "📚 API docs available at http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the service"
echo ""

# Start the service
uvicorn app:app --reload --port 8000
