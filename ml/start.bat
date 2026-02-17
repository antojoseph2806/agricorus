@echo off
echo === Starting Plant Disease Detection Server ===
echo.

REM Disable user site-packages to avoid conflicts
set PYTHONNOUSERSITE=1

REM Start server using venv python directly
echo Starting server at http://127.0.0.1:8000
echo API docs at http://127.0.0.1:8000/docs
echo.
echo Press CTRL+C to stop the server
echo.

venv\Scripts\python.exe -m uvicorn app:app --reload --host 127.0.0.1 --port 8000
