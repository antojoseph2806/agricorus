# ✅ Farmer Test Execution Checklist

Use this checklist before running the farmer CRUD test suite to ensure everything is properly configured.

## 📋 Pre-Test Checklist

### 1. Environment Setup
- [ ] Node.js installed (v14 or higher)
- [ ] npm or yarn installed
- [ ] Chrome or Edge browser installed
- [ ] Git repository cloned

### 2. Dependencies
- [ ] Navigate to `tests/selenium` directory
- [ ] Run `npm install`
- [ ] Verify `node_modules` folder exists
- [ ] Check for any installation errors

### 3. Configuration Files
- [ ] `.env` file exists (copy from `.env.example` if needed)
- [ ] `BASE_URL` set to `http://localhost:5173`
- [ ] `API_BASE_URL` set to `http://localhost:5000/api`
- [ ] Farmer credentials configured in `.env`
- [ ] Browser type set (chrome/edge)
- [ ] Headless mode configured (true/false)

### 4. Backend Server
- [ ] Backend server is running
- [ ] Backend accessible at `http://localhost:5000`
- [ ] Database connection established
- [ ] MongoDB running
- [ ] No backend errors in console

### 5. Frontend Server
- [ ] Frontend server is running
- [ ] Frontend accessible at `http://localhost:5173`
- [ ] No build errors
- [ ] No console errors in browser

### 6. Test User Account
- [ ] Farmer account exists in database
- [ ] Email: Matches `FARMER_EMAIL` in `.env`
- [ ] Password: Matches `FARMER_PASSWORD` in `.env`
- [ ] Account is verified (`isVerified: true`)
- [ ] Account is not blocked (`isBlocked: false`)
- [ ] Role is set to `farmer`

### 7. Database State
- [ ] Database is accessible
- [ ] Test data can be created
- [ ] Test data can be deleted
- [ ] No conflicting test data exists

### 8. Browser Configuration
- [ ] ChromeDriver/EdgeDriver installed
- [ ] Driver version matches browser version
- [ ] Browser can be launched programmatically
- [ ] No browser extensions interfering

## 🚀 Test Execution Checklist

### Before Running Tests
- [ ] All servers are running
- [ ] Run `npm run check-servers` successfully
- [ ] No other tests are running
- [ ] Screenshots folder is accessible
- [ ] Sufficient disk space available

### During Test Execution
- [ ] Monitor console output for errors
- [ ] Watch for timeout warnings
- [ ] Check browser window (if not headless)
- [ ] Verify test progress

### After Test Execution
- [ ] Review test results
- [ ] Check pass/fail count
- [ ] Review screenshots for failures
- [ ] Check console logs for errors
- [ ] Verify test data cleanup

## 🔍 Verification Checklist

### Test Results
- [ ] All tests passed OR
- [ ] Failures are documented
- [ ] Screenshots captured for failures
- [ ] Error messages are clear
- [ ] Execution time is reasonable (< 5 min)

### Data Cleanup
- [ ] Test projects deleted
- [ ] No orphaned test data
- [ ] Database state is clean
- [ ] No test artifacts remain

### Logs and Reports
- [ ] Console logs reviewed
- [ ] Screenshots organized
- [ ] Test report generated (if applicable)
- [ ] Errors documented

## 🐛 Troubleshooting Checklist

### If Tests Fail

#### Login Issues
- [ ] Verify farmer email in database
- [ ] Check password is correct
- [ ] Confirm account is verified
- [ ] Check account is not blocked
- [ ] Verify JWT_SECRET is set

#### Element Not Found
- [ ] Increase wait times in `.env`
- [ ] Run in non-headless mode
- [ ] Check if UI structure changed
- [ ] Verify page loaded completely
- [ ] Update locators if needed

#### Timeout Errors
- [ ] Check server response times
- [ ] Verify network connectivity
- [ ] Increase test timeout
- [ ] Check for slow database queries
- [ ] Monitor server resources

#### Server Connection
- [ ] Ping backend server
- [ ] Ping frontend server
- [ ] Check firewall settings
- [ ] Verify port availability
- [ ] Check CORS configuration

#### Browser Issues
- [ ] Update browser to latest version
- [ ] Update driver to match browser
- [ ] Clear browser cache
- [ ] Disable browser extensions
- [ ] Try different browser

## 📊 Test Execution Commands

### Quick Reference
```bash
# Check everything is ready
npm run check-servers

# Run all farmer tests
npm run test:farmer

# Run specific suites
npm run test:farmer-projects
npm run test:farmer-lands
npm run test:farmer-leases

# Run by operation
npm run test:farmer-create
npm run test:farmer-read
npm run test:farmer-update
npm run test:farmer-delete
```

## 📝 Documentation Checklist

### Before First Run
- [ ] Read `FARMER-README.md`
- [ ] Review `FARMER-TEST-GUIDE.md`
- [ ] Check `FARMER-TEST-SUMMARY.md`
- [ ] Understand test structure
- [ ] Know how to debug failures

### For Team Members
- [ ] Share test credentials securely
- [ ] Document any custom setup
- [ ] Explain test data strategy
- [ ] Provide troubleshooting tips
- [ ] Set up CI/CD if needed

## 🎯 Success Criteria

### All Checks Passed
- [ ] ✅ Environment configured
- [ ] ✅ Dependencies installed
- [ ] ✅ Servers running
- [ ] ✅ Test user exists
- [ ] ✅ Database accessible
- [ ] ✅ Browser configured
- [ ] ✅ Tests executed
- [ ] ✅ Results verified
- [ ] ✅ Data cleaned up
- [ ] ✅ Documentation reviewed

## 🔄 Regular Maintenance Checklist

### Weekly
- [ ] Run full test suite
- [ ] Review any failures
- [ ] Update test data if needed
- [ ] Check for UI changes
- [ ] Update documentation

### Monthly
- [ ] Update dependencies
- [ ] Review test coverage
- [ ] Optimize slow tests
- [ ] Update locators
- [ ] Refactor as needed

### Before Deployment
- [ ] Run all tests
- [ ] Verify 100% pass rate
- [ ] Check test execution time
- [ ] Review recent changes
- [ ] Update test documentation

## 📞 Support Checklist

### If You Need Help
- [ ] Check troubleshooting guide
- [ ] Review error messages
- [ ] Check screenshots
- [ ] Review console logs
- [ ] Check backend logs
- [ ] Verify configuration
- [ ] Try in debug mode
- [ ] Document the issue

### Reporting Issues
- [ ] Test name that failed
- [ ] Error message
- [ ] Screenshot (if available)
- [ ] Console logs
- [ ] Environment details
- [ ] Steps to reproduce
- [ ] Expected vs actual behavior

## 🎉 Ready to Test!

Once all items are checked, you're ready to run the farmer CRUD test suite!

```bash
# Windows
run-farmer-tests.bat

# Command Line
npm run test:farmer
```

---

**Tip**: Print this checklist and keep it handy for quick reference before each test run!

**Last Updated**: February 2026  
**Version**: 1.0.0
