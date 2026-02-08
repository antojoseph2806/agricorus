@echo off
echo ========================================
echo Cleaning Git Repository
echo ========================================
echo.
echo This will remove tracked files that should be ignored:
echo - .env files
echo - node_modules folders
echo - service-account.json
echo - build/dist folders
echo.
echo WARNING: This will modify your Git history!
echo Press Ctrl+C to cancel, or
pause

echo.
echo Removing .env files from Git...
git rm --cached backend/.env 2>nul
git rm --cached frontend/.env 2>nul
git rm --cached .env 2>nul
git rm --cached mobile_app/.env 2>nul

echo.
echo Removing node_modules from Git...
git rm -r --cached backend/node_modules 2>nul
git rm -r --cached frontend/node_modules 2>nul
git rm -r --cached node_modules 2>nul
git rm -r --cached mobile_app/node_modules 2>nul
git rm -r --cached tests/e2e/node_modules 2>nul

echo.
echo Removing service-account.json from Git...
git rm --cached backend/service-account.json 2>nul

echo.
echo Removing build/dist folders from Git...
git rm -r --cached frontend/dist 2>nul
git rm -r --cached backend/dist 2>nul
git rm -r --cached mobile_app/build 2>nul

echo.
echo ========================================
echo Cleanup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Review changes: git status
echo 2. Commit changes: git add .gitignore
echo 3. Commit: git commit -m "chore: update .gitignore and remove sensitive files"
echo 4. Push: git push
echo.
pause
