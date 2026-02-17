# 🏪 Vendor Tests - Quick Reference Card

## ⚡ Quick Commands

```bash
# Install
npm install

# Run all tests
npm run test:vendor

# Run by feature
npm run test:vendor-products
npm run test:vendor-orders

# Run by operation
npm run test:vendor-create
npm run test:vendor-read
npm run test:vendor-update
npm run test:vendor-delete

# Check servers
npm run check-servers

# Windows interactive
run-vendor-tests.bat
```

## 📋 Pre-Flight Checklist

- [ ] Backend running (port 5000)
- [ ] Frontend running (port 5173)
- [ ] `.env` configured
- [ ] Vendor account exists
- [ ] Account is verified
- [ ] Dependencies installed

## 🎯 Test Coverage

| Feature | Tests | CRUD |
|---------|-------|------|
| Products | 12 | ✅ Full |
| Orders | 3 | 📖 Read |
| Inventory | 2 | 📖 Read |
| Profile | 2 | 📖 Read |
| Dashboard | 2 | 📖 Read |
| Notifications | 1 | 📖 Read |
| Payments | 1 | 📖 Read |
| Feedback | 1 | 📖 Read |
| Support | 1 | 📖 Read |

**Total: 35+ tests**

## ⚙️ Configuration (.env)

```env
BASE_URL=http://localhost:5173
API_BASE_URL=http://localhost:5000/api
VENDOR_EMAIL=vendor@test.com
VENDOR_PASSWORD=Test@123
BROWSER=chrome
HEADLESS=false
```

## 🐛 Quick Fixes

### Login Fails
```bash
# Check account
mongo
use agricorus
db.vendors.findOne({ email: "vendor@test.com" })
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
35 passing (3m 30s)

✅ Product Management - CREATE (3)
✅ Product Management - READ (3)
✅ Product Management - UPDATE (3)
✅ Product Management - DELETE (2)
✅ Order Management - READ (3)
✅ Inventory Management - READ (2)
✅ Profile Management - READ (2)
✅ Dashboard - READ (2)
✅ Notifications - READ (1)
✅ Payments - READ (1)
✅ Feedback - READ (1)
✅ Support Queries - READ (1)
```

## 📁 Key Files

```
vendor-crud-comprehensive.test.js  # Main tests
VENDOR-README.md                   # Quick guide
VENDOR-TEST-SUMMARY.md            # Full summary
```

## 🔍 Debug Mode

```bash
set HEADLESS=false
set EXPLICIT_WAIT=30000
npm run test:vendor
```

## 📸 Screenshots

Location: `screenshots/`  
Format: `vendor-[test]-failure-[time].png`

## 🎯 Success Criteria

- ✅ All 35+ tests pass
- ✅ Execution < 5 minutes
- ✅ No manual intervention
- ✅ Screenshots on failure
- ✅ Clean test data

## 🚀 Get Started

```bash
cd tests/selenium
npm install
# Add vendor credentials to .env
npm run test:vendor
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

---

**Print this card for quick reference!**

**Version**: 1.0.0 | **Updated**: Feb 2026
