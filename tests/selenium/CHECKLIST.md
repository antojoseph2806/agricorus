# Pre-Test Execution Checklist

## ✅ Before Running Tests

### 1. Environment Setup
- [ ] Node.js installed
- [ ] Microsoft Edge browser installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured with correct credentials

### 2. Servers Running
- [ ] Frontend server running on `http://localhost:5173`
  ```bash
  cd frontend && npm run dev
  ```
- [ ] Backend server running on `http://localhost:5000`
  ```bash
  cd backend && npm start
  ```
- [ ] Verify servers: `npm run check-servers`

### 3. Test User Setup
- [ ] Test user exists in database
- [ ] Email: `nandu@gmail.com`
- [ ] Password: `Anto9862@`
- [ ] Role: `landowner`
- [ ] User can login manually via browser

### 4. Database State
- [ ] Database is accessible
- [ ] Test data can be created
- [ ] Test data can be deleted
- [ ] No conflicting test data from previous runs

### 5. Configuration Verification
- [ ] `.env` file has correct BASE_URL
- [ ] `.env` file has correct API_BASE_URL
- [ ] `.env` file has correct credentials
- [ ] Timeout values are appropriate (180000ms)

## ✅ Test Execution

### Run Tests
```bash
cd tests/selenium
npm run test:landowner
```

### Expected Output
```
Landowner CRUD Operations - Complete Test Suite
  ✅ WebDriver initialized
  Authentication
    ✅ should successfully login as landowner (17s)
    ✅ should navigate to My Lands page (2s)
  Create Land Listing (CREATE)
    ✅ should display Add Land button (2s)
    ✅ should open land creation form (3s)
    ✅ should successfully create a new land listing (5s)
    ...
  
  25+ passing (7-10 minutes)
  0 failing
```

## ✅ After Test Execution

### Verify Results
- [ ] All tests passed
- [ ] No timeout errors
- [ ] No element not found errors
- [ ] Test data cleaned up
- [ ] Screenshots only for failed tests (if any)

### Check Logs
- [ ] No JavaScript errors in console
- [ ] No network errors
- [ ] Proper navigation flow
- [ ] Forms submitted successfully

### Database Verification
- [ ] Test lands created during tests
- [ ] Test lands deleted during cleanup
- [ ] No orphaned test data
- [ ] Database in clean state

## ✅ Troubleshooting (If Tests Fail)

### Step 1: Check Screenshots
- [ ] Review screenshots in `./screenshots/`
- [ ] Identify which page/element failed
- [ ] Compare with expected UI

### Step 2: Check Servers
- [ ] Frontend accessible in browser
- [ ] Backend API responding
- [ ] No CORS errors
- [ ] Network tab shows successful requests

### Step 3: Check Test User
- [ ] Can login manually
- [ ] Has correct role
- [ ] Has necessary permissions
- [ ] Not locked or disabled

### Step 4: Check Configuration
- [ ] URLs are correct
- [ ] Credentials are correct
- [ ] Timeouts are sufficient
- [ ] Browser is compatible

### Step 5: Run in Debug Mode
- [ ] Set `HEADLESS=false` in `.env`
- [ ] Run tests again
- [ ] Watch browser execution
- [ ] Identify exact failure point

## ✅ Common Issues & Solutions

### Issue: Timeout Errors
**Solution:**
- [ ] Increase timeouts in `.env`
- [ ] Check server response times
- [ ] Verify network connectivity
- [ ] Ensure servers are not overloaded

### Issue: Element Not Found
**Solution:**
- [ ] Check UI hasn't changed
- [ ] Review page object selectors
- [ ] Update selectors if needed
- [ ] Verify correct page is loaded

### Issue: Login Fails
**Solution:**
- [ ] Verify test user exists
- [ ] Check credentials in `.env`
- [ ] Ensure user has landowner role
- [ ] Try manual login first

### Issue: Element Click Intercepted
**Solution:**
- [ ] Already fixed with JavaScript click
- [ ] If still occurs, check for overlays
- [ ] Verify scroll position
- [ ] Check z-index of elements

### Issue: Form Submission Fails
**Solution:**
- [ ] Check required fields are filled
- [ ] Verify form validation rules
- [ ] Check network requests
- [ ] Review backend logs

## ✅ Success Indicators

### All Green
- ✅ 25+ tests passing
- ✅ 0 tests failing
- ✅ Execution time: 7-10 minutes
- ✅ No errors in console
- ✅ Clean test data

### Test Coverage
- ✅ Authentication working
- ✅ Navigation working
- ✅ Create operations working
- ✅ Read operations working
- ✅ Update operations working
- ✅ Delete operations working
- ✅ Edge cases handled

### Quality Metrics
- ✅ No flaky tests
- ✅ Consistent results
- ✅ Fast execution
- ✅ Clear error messages
- ✅ Maintainable code

## ✅ Next Steps

### After All Tests Pass
1. [ ] Document any issues encountered
2. [ ] Update selectors if UI changed
3. [ ] Add new test cases if needed
4. [ ] Integrate into CI/CD pipeline
5. [ ] Schedule regular test runs

### Continuous Improvement
1. [ ] Monitor test execution times
2. [ ] Reduce flakiness
3. [ ] Add more edge cases
4. [ ] Improve error messages
5. [ ] Optimize wait times

### Extend Test Coverage
1. [ ] Add farmer role tests
2. [ ] Add investor role tests
3. [ ] Add admin role tests
4. [ ] Add API tests
5. [ ] Add performance tests

## 📞 Support

If you encounter issues:
1. Check `TROUBLESHOOTING.md`
2. Review `FINAL-STATUS.md`
3. Check screenshots
4. Review console logs
5. Verify all checklist items

## 🎉 Ready to Test!

Once all checklist items are complete:
```bash
npm run test:landowner
```

Expected result: **ALL TESTS PASS** ✅
