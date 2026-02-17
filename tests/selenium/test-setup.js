// Quick diagnostic test to check if WebDriver can initialize
const DriverFactory = require('./utils/driver-factory');

async function testSetup() {
  console.log('🔍 Testing WebDriver setup...');
  
  try {
    console.log('1. Creating driver...');
    const driver = await DriverFactory.createDriver();
    console.log('✅ Driver created successfully!');
    
    console.log('2. Navigating to Google...');
    await driver.get('https://www.google.com');
    console.log('✅ Navigation successful!');
    
    console.log('3. Getting page title...');
    const title = await driver.getTitle();
    console.log(`✅ Page title: ${title}`);
    
    console.log('4. Closing driver...');
    await driver.quit();
    console.log('✅ Driver closed successfully!');
    
    console.log('\n🎉 WebDriver setup is working correctly!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during setup test:');
    console.error(error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testSetup();
