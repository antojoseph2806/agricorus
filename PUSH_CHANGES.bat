@echo off
echo ========================================
echo Pushing Vercel Fix to GitHub
echo ========================================
echo.

echo Adding all changes...
git add .

echo.
echo Committing changes...
git commit -m "fix: simplify vercel.json and add deployment guides"

echo.
echo Pushing to GitHub...
git push

echo.
echo ========================================
echo Changes Pushed Successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Open ACTION_PLAN_NOW.md
echo 2. Choose a deployment method
echo 3. Follow the instructions
echo.
pause
