# Start FastAPI server with proper environment isolation
Write-Host "=== Starting Plant Disease Detection Server ===" -ForegroundColor Cyan

# Set environment variable to disable user site-packages
$env:PYTHONNOUSERSITE = "1"
Write-Host "✓ User site-packages disabled" -ForegroundColor Green

# Activate virtual environment
Write-Host "`nActivating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

# Verify NumPy version
Write-Host "`nChecking dependencies..." -ForegroundColor Yellow
$numpyVersion = python -c "import numpy; print(numpy.__version__)"
$opencvVersion = python -c "import cv2; print(cv2.__version__)"

Write-Host "  NumPy: $numpyVersion" -ForegroundColor White
Write-Host "  OpenCV: $opencvVersion" -ForegroundColor White

if ($numpyVersion -like "2.*") {
    Write-Host "`n⚠️  WARNING: NumPy 2.x detected!" -ForegroundColor Red
    Write-Host "Run fix_dependencies.ps1 first to install NumPy 1.26.2" -ForegroundColor Yellow
    exit 1
}

# Start server
Write-Host "`nStarting Uvicorn server..." -ForegroundColor Yellow
Write-Host "Server will be available at: http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "API docs: http://127.0.0.1:8000/docs" -ForegroundColor Cyan
Write-Host "`nPress CTRL+C to stop the server`n" -ForegroundColor Gray

uvicorn app:app --reload --host 127.0.0.1 --port 8000
