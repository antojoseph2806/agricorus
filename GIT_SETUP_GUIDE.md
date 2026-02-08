# Git Setup Guide

## 🎯 Goal
Push your code to Git while excluding:
- ✅ node_modules folders
- ✅ .env files
- ✅ service-account.json
- ✅ build/dist folders
- ✅ Other sensitive/unnecessary files

## 📋 Step-by-Step Instructions

### Step 1: Clean Git Repository (Remove Already Tracked Files)

Run the cleanup script:
```bash
CLEAN_GIT_REPO.bat
```

Or manually run these commands:
```bash
# Remove .env files
git rm --cached backend/.env
git rm --cached frontend/.env
git rm --cached .env

# Remove node_modules
git rm -r --cached backend/node_modules
git rm -r --cached frontend/node_modules
git rm -r --cached node_modules
git rm -r --cached mobile_app/node_modules
git rm -r --cached tests/e2e/node_modules

# Remove service account
git rm --cached backend/service-account.json

# Remove build folders
git rm -r --cached frontend/dist
git rm -r --cached mobile_app/build
```

### Step 2: Verify .gitignore Files

Check that these files exist and are correct:
- ✅ `.gitignore` (root)
- ✅ `backend/.gitignore`
- ✅ `frontend/.gitignore`
- ✅ `mobile_app/.gitignore`

### Step 3: Check What Will Be Committed

```bash
git status
```

You should see:
- ✅ Modified .gitignore files
- ✅ Deleted node_modules entries
- ✅ Deleted .env entries
- ❌ NO .env files listed
- ❌ NO node_modules listed

### Step 4: Stage Changes

```bash
# Add all changes
git add .

# Or add specific files
git add .gitignore
git add backend/.gitignore
git add frontend/.gitignore
git add mobile_app/.gitignore
```

### Step 5: Commit Changes

```bash
git commit -m "chore: update .gitignore and remove sensitive files from tracking"
```

### Step 6: Push to Remote Repository

If you haven't set up a remote repository yet:

#### Option A: GitHub
```bash
# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/agricorus.git
git branch -M main
git push -u origin main
```

#### Option B: GitLab
```bash
git remote add origin https://gitlab.com/YOUR_USERNAME/agricorus.git
git branch -M main
git push -u origin main
```

#### Option C: Bitbucket
```bash
git remote add origin https://bitbucket.org/YOUR_USERNAME/agricorus.git
git branch -M main
git push -u origin main
```

If you already have a remote:
```bash
git push
```

## 🔒 Create .env.example Files

Create example environment files for other developers:

### backend/.env.example
```bash
# Create example file
echo "PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret" > backend/.env.example
```

### frontend/.env.example
```bash
# Create example file
echo "VITE_BACKEND_URL=https://agricorus.onrender.com" > frontend/.env.example
```

Then commit these example files:
```bash
git add backend/.env.example frontend/.env.example
git commit -m "docs: add .env.example files"
git push
```

## ✅ Verification Checklist

Before pushing, verify:

- [ ] `.env` files are NOT in `git status`
- [ ] `node_modules` folders are NOT in `git status`
- [ ] `service-account.json` is NOT in `git status`
- [ ] `.gitignore` files are properly configured
- [ ] `.env.example` files are created (optional but recommended)
- [ ] All your source code IS included
- [ ] README files are included

## 🚨 If You Accidentally Committed Sensitive Data

If you already pushed sensitive data (like API keys) to Git:

### 1. Change All Secrets Immediately
- Generate new API keys
- Change database passwords
- Rotate JWT secrets
- Update all credentials

### 2. Remove from Git History (Advanced)
```bash
# Use BFG Repo-Cleaner or git filter-branch
# This rewrites history - use with caution!

# Install BFG
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# Remove .env files from history
java -jar bfg.jar --delete-files .env

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (WARNING: This affects all collaborators)
git push --force
```

## 📝 What's Included in Git

✅ **Included:**
- Source code (.js, .ts, .tsx, .dart)
- Configuration files (package.json, pubspec.yaml)
- Documentation (.md files)
- .gitignore files
- Public assets (images, icons)
- .env.example files

❌ **Excluded:**
- node_modules/
- .env files
- service-account.json
- build/dist folders
- Logs
- OS-specific files (.DS_Store, Thumbs.db)
- IDE files (.vscode, .idea)
- Temporary files

## 🔄 For Team Members Cloning the Repo

After cloning, they need to:

1. **Install dependencies:**
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install

# Mobile
cd mobile_app
flutter pub get
```

2. **Create .env files:**
```bash
# Copy example files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Then edit with actual values
```

3. **Add service-account.json** (if needed):
- Get the file from team lead
- Place in `backend/service-account.json`

## 🎉 Done!

Your repository is now clean and ready to share!

## 📞 Need Help?

Common issues:
- **"File still showing in git status"**: Run `git rm --cached <file>` again
- **"node_modules too large"**: Make sure .gitignore is correct before adding
- **"Permission denied"**: Check your Git credentials and repository access
