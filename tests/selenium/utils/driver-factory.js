const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');
const config = require('../config/test-config');

class DriverFactory {
  static async createDriver() {
    try {
      console.log('Creating Chrome driver with options...');
      console.log('ChromeDriver path:', chromedriver.path);
      
      const chromeOptions = new chrome.Options();
      
      if (config.headless) {
        chromeOptions.addArguments('--headless=new');
        console.log('Running in headless mode');
      }
      
      // Essential Chrome arguments for stability
      chromeOptions.addArguments('--no-sandbox');
      chromeOptions.addArguments('--disable-dev-shm-usage');
      chromeOptions.addArguments('--disable-gpu');
      chromeOptions.addArguments('--disable-software-rasterizer');
      chromeOptions.addArguments('--window-size=1920,1080');
      chromeOptions.addArguments('--disable-blink-features=AutomationControlled');
      chromeOptions.addArguments('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      chromeOptions.addArguments('--disable-extensions');
      chromeOptions.addArguments('--disable-infobars');
      chromeOptions.addArguments('--ignore-certificate-errors');
      
      // Set ChromeDriver service
      const service = new chrome.ServiceBuilder(chromedriver.path);

      console.log('Building WebDriver instance...');
      const driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(chromeOptions)
        .setChromeService(service)
        .build();

      console.log('Setting timeouts and maximizing window...');
      await driver.manage().setTimeouts({ 
        implicit: config.implicitWait,
        pageLoad: 60000,
        script: 30000
      });
      
      if (!config.headless) {
        await driver.manage().window().maximize();
      }

      console.log('Driver created successfully');
      return driver;
    } catch (error) {
      console.error('\n❌ Failed to create driver:', error.message);
      console.error('\nPossible causes:');
      console.error('1. Chrome browser is not installed');
      console.error('2. ChromeDriver version does not match Chrome version');
      console.error('3. Chrome is installed in a non-standard location');
      console.error('\nTroubleshooting steps:');
      console.error('1. Install Chrome browser from: https://www.google.com/chrome/');
      console.error('2. Update ChromeDriver: npm install chromedriver@latest');
      console.error('3. Try running in headless mode: Set HEADLESS=true in .env');
      console.error('\nFull error:', error);
      throw error;
    }
  }

  static async quitDriver(driver) {
    if (driver) {
      await driver.quit();
    }
  }
}

module.exports = DriverFactory;
