# Vercel Deployment Guide for Agricorus

## 🎯 Problem
Your project has both backend and frontend in the same repository, but Vercel needs to deploy only the frontend.

## ✅ Solution: Configure Vercel Project Settings

### Option 1: Deploy from Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click "Add New" → "Project"

2. **Import Your Repository**
   - Select your GitHub repository: `agricorus`
   - Click "Import"

3. **Configure Project Settings**
   
   **Framework Preset:** Vite
   
   **Root Directory:** `frontend` ← **IMPORTANT!**
   
   **Build Command:**
   ```bash
   npm run build
   ```
   
   **Output Directory:**
   ```bash
   dist
   ```
   
   **Install Command:**
   ```bash
   npm install
   ```

4. **Environment Variables**
   Add this environment variable:
   - Key: `VITE_BACKEND_URL`
   - Value: `https://agricorus.onrender.com`

5. **Click "Deploy"**

### Option 2: Use Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from frontend directory
cd frontend
vercel --prod
```

## 📁 File Structure for Vercel

Your repository structure:
```
agricorus/
├── backend/          ← Not deployed to Vercel
├── frontend/         ← Deploy THIS to Vercel
│   ├── dist/         ← Build output
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── mobile_app/       ← Not deployed to Vercel
└── vercel.json       ← Root config (optional)
```

## 🔧 Configuration Files

### Root vercel.json (Current)
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "frontend/dist",
  "installCommand": "npm run install:frontend",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### frontend/vercel.json (Existing)
```json
{
  "version": 2,
  "builds": [
    { "src": "package.json", "use": "@vercel/static-build", "config": { "distDir": "dist" } }
  ],
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## 🚀 Deployment Steps

### Step 1: Push Your Code to GitHub
```bash
git add .
git commit -m "chore: configure for Vercel deployment"
git push
```

### Step 2: Configure Vercel (Choose One Method)

#### Method A: Vercel Dashboard (Easiest)
1. Go to https://vercel.com/new
2. Import your GitHub repo
3. Set **Root Directory** to `frontend`
4. Add environment variable: `VITE_BACKEND_URL=https://agricorus.onrender.com`
5. Click Deploy

#### Method B: Vercel CLI
```bash
cd frontend
vercel --prod
```

### Step 3: Verify Deployment
After deployment, test:
- ✅ Homepage loads
- ✅ Login works
- ✅ Registration works
- ✅ API calls reach your backend
- ✅ Images load correctly

## 🔍 Troubleshooting

### Error: "Build failed"
**Solution:** Make sure Root Directory is set to `frontend` in Vercel settings

### Error: "API calls failing"
**Solution:** Check environment variable `VITE_BACKEND_URL` is set correctly

### Error: "404 on page refresh"
**Solution:** The `vercel.json` rewrites should handle this. Make sure it exists.

### Error: "Images not loading"
**Solution:** Check that image URLs use the full backend URL:
```typescript
const imageUrl = `${import.meta.env.VITE_BACKEND_URL}${imagePath}`;
```

## 📝 Environment Variables in Vercel

Add these in Vercel Dashboard → Project Settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_BACKEND_URL` | `https://agricorus.onrender.com` | Production |

## 🔄 Automatic Deployments

Once configured, Vercel will automatically deploy when you:
- ✅ Push to `main` branch (production)
- ✅ Push to other branches (preview deployments)
- ✅ Open pull requests (preview deployments)

## 🎯 Quick Fix for Current Error

The error you're seeing is because Vercel is trying to build from the root. Here's the fix:

1. **Go to your Vercel project settings:**
   - https://vercel.com/[your-username]/[project-name]/settings

2. **Under "Build & Development Settings":**
   - Root Directory: `frontend` ← **Set this!**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Redeploy:**
   - Go to Deployments tab
   - Click "Redeploy" on the latest deployment

## ✅ Success Checklist

After deployment:
- [ ] Site is accessible at your Vercel URL
- [ ] Login page works
- [ ] Registration with OTP works
- [ ] Marketplace loads products
- [ ] Images display correctly
- [ ] API calls reach backend successfully
- [ ] No console errors

## 🌐 Custom Domain (Optional)

To add a custom domain:
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)

## 📊 Monitoring

After deployment, monitor:
- **Analytics:** Vercel Dashboard → Analytics
- **Logs:** Vercel Dashboard → Deployments → View Function Logs
- **Performance:** Check Core Web Vitals in Analytics

## 🆘 Still Having Issues?

1. **Check build logs** in Vercel dashboard
2. **Verify environment variables** are set
3. **Test locally** with `npm run build` in frontend folder
4. **Check backend** is accessible from Vercel's servers

## 📞 Support

- Vercel Docs: https://vercel.com/docs
- Vite Docs: https://vitejs.dev/guide/
- Your backend: https://agricorus.onrender.com

---

**Quick Command Reference:**
```bash
# Test build locally
cd frontend
npm install
npm run build
npm run preview

# Deploy with CLI
cd frontend
vercel --prod
```
