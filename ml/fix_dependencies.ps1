# Fix NumPy and OpenCV dependencies in virtual environment
Write-Host "=== Fixing Dependencies ===" -ForegroundColor Cyan

# Activate virtual environment
Write-Host "`n1. Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

# Check current versions
Write-Host "`n2. Current package versions:" -ForegroundColor Yellow
python -m pip list | Select-String -Pattern "numpy|opencv|tensorflow"

# Uninstall conflicting packages
Write-Host "`n3. Removing conflicting packages..." -ForegroundColor Yellow
python -m pip uninstall opencv-python opencv-python-headless numpy -y

# Install correct versions
Write-Host "`n4. Installing NumPy 1.26.2..." -ForegroundColor Yellow
python -m pip install numpy==1.26.2

Write-Host "`n5. Installing OpenCV-Python-Headless 4.8.1.78..." -ForegroundColor Yellow
python -m pip install opencv-python-headless==4.8.1.78

# Verify installation
Write-Host "`n6. Verifying installation..." -ForegroundColor Yellow
python -m pip list | Select-String -Pattern "numpy|opencv"

# Test imports
Write-Host "`n7. Testing imports..." -ForegroundColor Yellow
python -c "import cv2; import numpy; import tensorflow; print('✓ All imports successful!')"

Write-Host "`n=== Fix Complete ===" -ForegroundColor Green
Write-Host "`nYou can now start the server with:" -ForegroundColor Cyan
Write-Host "  uvicorn app:app --reload" -ForegroundColor White
