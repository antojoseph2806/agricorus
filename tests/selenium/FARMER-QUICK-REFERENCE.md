# 🌾 Farmer Tests - Quick Reference Card

## ⚡ Quick Commands

```bash
# Install
npm install

# Run all tests
npm run test:farmer

# Run by feature
npm run test:farmer-projects
npm run test:farmer-lands
npm run test:farmer-leases

# Run by operation
npm run test:farmer-create
npm run test:farmer-read
npm run test:farmer-update
npm run test:farmer-delete

# Check servers
npm run check-servers

# Windows interactive
run-farmer-tests.bat
```

## 📋 Pre-Flight Checklist

- [ ] Backend running (port 5000)
- [ ] Frontend running (port 5173)
- [ ] `.env` configured
- [ ] Farmer account exists
- [ ] Account is verified
- [ ] Dependencies installed

## 🎯 Test Coverage

| Feature | Tests | CRUD |
|---------|-------|------|
| Projects | 12 | ✅ Full |
| Lands | 4 | 📖 Read |
| Leases | 3 | 📖 Read |
| Profile | 2 | 📖 Read |
| KYC | 3 | 📖 Read |
| Disputes | 3 | 📖 Read |
| Dashboard | 2 | 📖 Read |

**Total: 40+ tests**

## ⚙️ Configuration (.env)

```env
BASE_URL=http://localhost:5173
API_BASE_URL=http://localhost:5000/api
FARMER_EMAIL=farmer@test.com
FARMER_PASSWORD=Test@123
BROWSER=chrome
HEADLESS=false
```

## 🐛 Quick Fixes

### Login Fails
```bash
# Check account
mongo
use agricorus
db.users.findOne({ email: "farmer@test.com" })
```

### Element Not Found
```env
# Increase waits
EXPLICIT_WAIT=30000
HEADLESS=false
```

### Server Issues
```bash
npm run check-servers
```

### Timeout
```javascript
this.timeout(300000); // 5 min
```

## 📊 Expected Output

```
40 passing (3m 25s)

✅ Project Management - CREATE (3)
✅ Project Management - READ (4)
✅ Project Management - UPDATE (3)
✅ Project Management - DELETE (2)
✅ Land Browsing - READ (4)
✅ Lease Management - READ (3)
✅ Profile Management - READ (2)
✅ KYC Management - READ (3)
✅ Dispute Management - READ (3)
✅ Dashboard - READ (2)
```

## 📁 Key Files

```
farmer-crud-comprehensive.test.js  # Main tests
pages/farmer-page.js               # Page objects
utils/farmer-test-data.js          # Data generator
FARMER-README.md                   # Quick guide
FARMER-TEST-GUIDE.md              # Full guide
```

## 🔍 Debug Mode

```bash
set HEADLESS=false
set EXPLICIT_WAIT=30000
npm run test:farmer
```

## 📸 Screenshots

Location: `screenshots/`  
Format: `farmer-[test]-failure-[time].png`

## 🎯 Success Criteria

- ✅ All 40+ tests pass
- ✅ Execution < 5 minutes
- ✅ No manual intervention
- ✅ Screenshots on failure
- ✅ Clean test data

## 📚 Documentation

1. **Quick Start**: `FARMER-README.md`
2. **Full Guide**: `FARMER-TEST-GUIDE.md`
3. **Checklist**: `FARMER-TEST-CHECKLIST.md`
4. **Complete**: `FARMER-COMPLETE-GUIDE.md`
5. **Summary**: `FARMER-TEST-SUMMARY.md`

## 🚀 Get Started

```bash
cd tests/selenium
npm install
copy .env.example .env
npm run test:farmer
```

## 💡 Tips

- Run `check-servers` first
- Use non-headless for debugging
- Check screenshots on failure
- Increase timeouts if slow
- Keep test data unique

## 📞 Help

1. Check error message
2. Review screenshot
3. Check console logs
4. Verify configuration
5. Try debug mode
6. Read troubleshooting guide

---

**Print this card for quick reference!**

**Version**: 1.0.0 | **Updated**: Feb 2026
