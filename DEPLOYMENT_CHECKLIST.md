# Deployment Checklist ✅

## Backend (Render) - Already Deployed
- ✅ Hosted at: `https://agricorus.onrender.com`
- ✅ All API endpoints accessible

## Frontend (Web App) - Ready to Deploy

### Pre-deployment Verification
```bash
cd frontend
npm install
npm run build
```

### Environment Variables
- ✅ `.env` configured with production URL
- ✅ All hardcoded URLs updated to Render URL

### Deploy to Vercel/Netlify
```bash
# Vercel
vercel --prod

# Or Netlify
netlify deploy --prod
```

### Post-deployment Test
Test these URLs after deployment:
- [ ] Login page works
- [ ] Registration with OTP works
- [ ] Vendor login works
- [ ] Marketplace loads products
- [ ] Image uploads work

## Mobile App (Flutter) - Ready to Build

### Pre-build Verification
```bash
cd mobile_app
flutter pub get
flutter analyze
```

### Build for Android
```bash
flutter build apk --release
# APK location: build/app/outputs/flutter-apk/app-release.apk
```

### Build for iOS
```bash
flutter build ios --release
# Then open in Xcode for signing and distribution
```

### Test on Device
- [ ] Login works
- [ ] Registration with OTP works
- [ ] Role-based dashboards load
- [ ] Logout works

## API Endpoints to Verify

### Authentication
- [ ] `POST /api/auth/login`
- [ ] `POST /api/auth/register`
- [ ] `POST /api/auth/verify-otp`
- [ ] `POST /api/auth/resend-otp`

### Vendor
- [ ] `POST /api/vendors/login`
- [ ] `POST /api/vendors/register`
- [ ] `GET /api/vendor/profile`
- [ ] `GET /api/vendor/products`

### Marketplace
- [ ] `GET /api/marketplace/products`
- [ ] `POST /api/marketplace/cart`
- [ ] `POST /api/marketplace/orders`

### Projects
- [ ] `GET /api/projects/investor`
- [ ] `POST /api/projects`

## CORS Configuration

Ensure your backend allows requests from:
- Your web app domain (e.g., `https://yourdomain.com`)
- Mobile app (allow all origins or specific mobile user agents)

In your backend `server.js`:
```javascript
const cors = require('cors');
app.use(cors({
  origin: ['https://yourdomain.com', 'http://localhost:5173'],
  credentials: true
}));
```

## Environment-Specific Notes

### Production (Current)
- Backend: `https://agricorus.onrender.com`
- Frontend: Deploy to Vercel/Netlify
- Mobile: Build release APK/IPA

### Development (Local)
- Backend: `http://localhost:5000`
- Frontend: Update `.env` to `http://localhost:5000`
- Mobile: Update `ApiService.baseUrl` to local IP

## Troubleshooting

### If API calls fail:
1. Check Render backend is running (not sleeping)
2. Verify CORS settings
3. Check network tab in browser DevTools
4. Verify API endpoints in backend logs

### If images don't load:
1. Check image URLs include full domain
2. Verify file upload paths in backend
3. Check CORS for static file serving

### If mobile app can't connect:
1. Verify device has internet connection
2. Check if Render backend is accessible from mobile network
3. Test API endpoints in browser on mobile device

## Success Criteria

✅ Web app deployed and accessible
✅ Mobile app builds successfully
✅ Users can register and login
✅ All role-based features work
✅ Images and files load correctly
✅ API responses are fast (<2s)

## Next Steps After Deployment

1. Monitor Render backend logs for errors
2. Set up error tracking (Sentry, LogRocket)
3. Configure analytics (Google Analytics, Mixpanel)
4. Set up automated backups for database
5. Configure SSL certificates (if custom domain)
6. Set up CI/CD pipeline for automated deployments
