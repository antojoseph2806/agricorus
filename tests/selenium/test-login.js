// Quick test to verify login credentials
const DriverFactory = require('./utils/driver-factory');
const TestHelpers = require('./utils/test-helpers');
const LoginPage = require('./pages/login-page');
const config = require('./config/test-config');

async function testLogin() {
  console.log('🔍 Testing login with configured credentials...');
  console.log(`📧 Email: ${config.landowner.email}`);
  console.log(`🌐 URL: ${config.baseUrl}`);
  
  let driver;
  
  try {
    console.log('\n1. Creating driver...');
    driver = await DriverFactory.createDriver();
    console.log('✅ Driver created');
    
    const helpers = new TestHelpers(driver);
    const loginPage = new LoginPage(driver, helpers);
    
    console.log('\n2. Navigating to login page...');
    await loginPage.navigateToLogin();
    console.log('✅ Login page loaded');
    
    console.log('\n3. Attempting login...');
    await loginPage.loginAsLandowner();
    console.log('✅ Login form submitted');
    
    console.log('\n4. Checking if login was successful...');
    await driver.sleep(3000); // Wait for redirect
    
    const currentUrl = await driver.getCurrentUrl();
    console.log(`Current URL: ${currentUrl}`);
    
    const isLoggedIn = await loginPage.isLoginSuccessful();
    
    if (isLoggedIn) {
      console.log('\n✅ ✅ ✅ LOGIN SUCCESSFUL! ✅ ✅ ✅');
      console.log('Your credentials are working correctly.');
      console.log('You can now run the full test suite with: npm run test:landowner');
    } else {
      console.log('\n❌ LOGIN FAILED');
      console.log('Please check:');
      console.log('1. User exists in database with landowner role');
      console.log('2. Email and password in .env are correct');
      console.log('3. Backend server is running properly');
      
      // Try to get error message
      const errorMsg = await loginPage.getErrorMessage();
      if (errorMsg) {
        console.log(`\nError message: ${errorMsg}`);
      }
    }
    
    console.log('\n5. Taking screenshot...');
    await helpers.takeScreenshot('login-test-result');
    console.log('✅ Screenshot saved');
    
  } catch (error) {
    console.error('\n❌ Error during login test:');
    console.error(error.message);
    
    if (driver) {
      try {
        const helpers = new TestHelpers(driver);
        await helpers.takeScreenshot('login-test-error');
        console.log('Screenshot saved to screenshots/');
      } catch (e) {
        // Ignore screenshot errors
      }
    }
  } finally {
    if (driver) {
      console.log('\n6. Closing driver...');
      await driver.quit();
      console.log('✅ Driver closed');
    }
  }
}

testLogin();
