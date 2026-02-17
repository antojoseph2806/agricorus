# Quick Test Execution Guide

## Prerequisites ✅

1. **Servers Running**
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:5000`

2. **Test User Exists**
   - Email: `nandu@gmail.com`
   - Password: `Anto9862@`
   - Role: landowner

3. **Dependencies Installed**
   ```bash
   npm install
   ```

## Run Tests

### All Landowner Tests
```bash
npm run test:landowner
```

### Specific Test Categories
```bash
# Create operations
npm run test:landowner-create

# Read operations
npm run test:landowner-read

# Update operations
npm run test:landowner-update

# Delete operations
npm run test:landowner-delete
```

## Expected Output

```
Landowner CRUD Operations - Complete Test Suite
  ✅ WebDriver initialized
  
  Authentication
    ✅ should successfully login as landowner
    ✅ should navigate to My Lands page
  
  Create Land Listing (CREATE)
    ✅ should display Add Land button
    ✅ should open land creation form
    ✅ should successfully create a new land listing
    ✅ should validate required fields
    ✅ should create land with minimum required fields
    ✅ should handle large numeric values
  
  Read Land Listings (READ)
    ✅ should display list of all lands
    ✅ should display created land in the list
    ✅ should view land details
    ✅ should display correct land information
    ✅ should navigate back to land list
  
  Update Land Listing (UPDATE)
    ✅ should open edit form for a land
    ✅ should display existing land data
    ✅ should successfully update land title
    ✅ should successfully update land price
    ✅ should successfully update multiple fields
    ✅ should validate required fields on update
    ✅ should cancel update and return to list
  
  Delete Land Listing (DELETE)
    ✅ should display delete button
    ✅ should show confirmation dialog
    ✅ should successfully delete land
    ✅ should not find deleted land in list
  
  Edge Cases and Error Handling
    ✅ should handle special characters
    ✅ should handle very long land title
    ✅ should handle decimal values
    ✅ should handle negative coordinates
    ✅ should maintain data integrity after refresh
  
  Pagination and Filtering
    ✅ should handle empty land list
    ✅ should display lands in consistent order
  
  Cleanup
    ✅ should clean up test data

  25+ passing (7-10 minutes)
```

## Debug Mode

Run tests with visible browser:

1. Edit `.env`:
   ```env
   HEADLESS=false
   ```

2. Run tests:
   ```bash
   npm run test:landowner
   ```

3. Watch the browser execute tests in real-time

## Check Server Status

Before running tests:
```bash
npm run check-servers
```

Output:
```
✅ Frontend Server: http://localhost:5173 - Status: 200
✅ Backend Server: http://localhost:5000/api - Status: 200
✅ All servers are running! You can proceed with tests.
```

## View Test Results

### Screenshots
Failed tests save screenshots to:
```
./screenshots/failed-[test-name]-[timestamp].png
```

### Console Output
- Real-time test progress
- Detailed error messages
- Execution times per test

## Common Issues

### Issue: "Servers not running"
**Solution:**
```bash
# Terminal 1 - Frontend
cd frontend
npm run dev

# Terminal 2 - Backend  
cd backend
npm start

# Terminal 3 - Tests
cd tests/selenium
npm run test:landowner
```

### Issue: "Login failed"
**Solution:**
- Verify test user exists in database
- Check credentials in `.env` file
- Ensure user has 'landowner' role

### Issue: "Element not found"
**Solution:**
- UI might have changed
- Check screenshots in `./screenshots/`
- Update selectors in `pages/landowner-page.js`

### Issue: "Timeout"
**Solution:**
- Increase timeout in `.env`:
  ```env
  IMPLICIT_WAIT=15000
  EXPLICIT_WAIT=40000
  ```

## Test Execution Time

- Full suite: ~7-10 minutes
- Create tests: ~2-3 minutes
- Read tests: ~1-2 minutes
- Update tests: ~2-3 minutes
- Delete tests: ~1-2 minutes

## Success Indicators

✅ All tests passing  
✅ No timeout errors  
✅ No element not found errors  
✅ Clean test data after execution  
✅ Screenshots only for failed tests  

## Next Steps After Tests Pass

1. ✅ Tests are production-ready
2. ✅ Can be integrated into CI/CD pipeline
3. ✅ Can run on schedule (nightly builds)
4. ✅ Can be extended for other user roles (farmer, investor, admin)

## Support

For issues or questions:
1. Check `TROUBLESHOOTING.md`
2. Check `FINAL-STATUS.md`
3. Review screenshots in `./screenshots/`
4. Check console output for detailed errors
