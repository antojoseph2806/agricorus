# 🚀 Deploy with Vercel CLI - Step by Step

This is the **most reliable** way to deploy your frontend.

## Step 1: Install Vercel CLI

Open your terminal and run:
```bash
npm install -g vercel
```

## Step 2: Navigate to Frontend Folder

```bash
cd frontend
```

## Step 3: Login to Vercel

```bash
vercel login
```

This will open your browser. Login with your Vercel account.

## Step 4: Deploy

```bash
vercel --prod
```

### You'll see prompts like this:

**Prompt 1:**
```
? Set up and deploy "~/agricorus/frontend"? [Y/n]
```
**Answer:** Press `Y` and Enter

**Prompt 2:**
```
? Which scope do you want to deploy to?
```
**Answer:** Select your Vercel account (use arrow keys, press Enter)

**Prompt 3:**
```
? Link to existing project? [y/N]
```
**Answer:** Press `N` and Enter (create new project)

**Prompt 4:**
```
? What's your project's name?
```
**Answer:** Type `agricorus` and press Enter

**Prompt 5:**
```
? In which directory is your code located? ./
```
**Answer:** Just press Enter (it's already correct)

**Prompt 6:**
```
? Want to override the settings? [y/N]
```
**Answer:** Press `N` and Enter

## Step 5: Wait for Deployment

You'll see:
```
🔗  Linked to your-username/agricorus
🔍  Inspect: https://vercel.com/...
✅  Production: https://agricorus-xxx.vercel.app [copied to clipboard]
```

## Step 6: Add Environment Variable

After first deployment, add the environment variable:

```bash
vercel env add VITE_BACKEND_URL
```

When prompted:
- **Value:** `https://agricorus.onrender.com`
- **Environment:** Select all (Production, Preview, Development)

Then redeploy:
```bash
vercel --prod
```

## ✅ Done!

Your site is now live at the URL shown in the terminal!

## 🔍 Verify Deployment

1. Visit the URL from the terminal
2. Test login/registration
3. Check browser console for errors
4. Verify API calls work

## 📝 For Future Deployments

After the initial setup, just run:
```bash
cd frontend
vercel --prod
```

That's it! No configuration needed.

## 🆘 Troubleshooting

### Error: "Command not found: vercel"
**Solution:** Install globally with admin rights:
```bash
# Windows (run as Administrator)
npm install -g vercel

# Mac/Linux
sudo npm install -g vercel
```

### Error: "Not authorized"
**Solution:** Login again:
```bash
vercel logout
vercel login
```

### Error: "Build failed"
**Solution:** Test build locally first:
```bash
cd frontend
npm install
npm run build
```

If local build works, try deploying again.

---

**This method bypasses all configuration issues and deploys directly from the frontend folder!**
