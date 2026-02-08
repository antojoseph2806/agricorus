# 🚨 Vercel Deployment Quick Fix

## The Problem
Vercel is trying to build from the root directory, but your frontend is in the `frontend/` folder.

## ✅ The Solution (2 Minutes)

### Step 1: Go to Vercel Project Settings
1. Open your Vercel dashboard: https://vercel.com/dashboard
2. Click on your `agricorus` project
3. Click "Settings" tab

### Step 2: Update Root Directory
1. Scroll to "Build & Development Settings"
2. Find **"Root Directory"**
3. Click "Edit"
4. Enter: `frontend`
5. Click "Save"

### Step 3: Verify Other Settings
Make sure these are set:

- **Framework Preset:** Vite
- **Build Command:** `npm run build` (or leave empty for auto-detect)
- **Output Directory:** `dist` (or leave empty for auto-detect)
- **Install Command:** `npm install` (or leave empty for auto-detect)

### Step 4: Add Environment Variable
1. Still in Settings, go to "Environment Variables"
2. Click "Add New"
3. Key: `VITE_BACKEND_URL`
4. Value: `https://agricorus.onrender.com`
5. Select: Production, Preview, Development (all three)
6. Click "Save"

### Step 5: Redeploy
1. Go to "Deployments" tab
2. Find the latest failed deployment
3. Click the three dots (•••)
4. Click "Redeploy"
5. Wait for deployment to complete

## 🎉 Done!

Your site should now deploy successfully!

---

## Alternative: Deploy Using Vercel CLI

If the above doesn't work, try this:

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd frontend

# Deploy
vercel --prod
```

Follow the prompts and it will deploy correctly.

---

## 📸 Visual Guide

**Where to find Root Directory setting:**
```
Vercel Dashboard
  → Your Project
    → Settings
      → General
        → Build & Development Settings
          → Root Directory: [Edit] → Enter "frontend"
```

---

## ✅ Verification

After redeployment, your site should:
- ✅ Load without errors
- ✅ Show your homepage
- ✅ Allow login/registration
- ✅ Connect to backend API

---

## 🆘 Still Not Working?

Check the build logs:
1. Go to Deployments tab
2. Click on the latest deployment
3. Click "View Build Logs"
4. Look for errors

Common issues:
- Missing environment variables
- Wrong root directory
- Build command errors

See `VERCEL_DEPLOYMENT_GUIDE.md` for detailed troubleshooting.
