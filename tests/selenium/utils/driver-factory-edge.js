const { Builder } = require('selenium-webdriver');
const edge = require('selenium-webdriver/edge');
const config = require('../config/test-config');
const { execSync } = require('child_process');
const path = require('path');

class DriverFactory {
  static async createDriver() {
    try {
      console.log('Creating Microsoft Edge driver...');
      
      const edgeOptions = new edge.Options();
      
      if (config.headless) {
        edgeOptions.addArguments('--headless=new');
        console.log('Running in headless mode');
      }
      
      // Essential Edge arguments for stability
      edgeOptions.addArguments('--no-sandbox');
      edgeOptions.addArguments('--disable-dev-shm-usage');
      edgeOptions.addArguments('--disable-gpu');
      edgeOptions.addArguments('--disable-software-rasterizer');
      edgeOptions.addArguments('--window-size=1920,1080');
      edgeOptions.addArguments('--disable-blink-features=AutomationControlled');
      edgeOptions.addArguments('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      edgeOptions.addArguments('--disable-extensions');
      edgeOptions.addArguments('--disable-infobars');
      edgeOptions.addArguments('--ignore-certificate-errors');
      edgeOptions.addArguments('--inprivate');

      // Try to find msedgedriver
      let edgeDriverPath = null;
      const possiblePaths = [
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedgedriver.exe',
        'C:\\Program Files\\Microsoft\\Edge\\Application\\msedgedriver.exe',
        path.join(process.env.LOCALAPPDATA || '', 'Microsoft\\Edge\\Application\\msedgedriver.exe')
      ];

      for (const driverPath of possiblePaths) {
        const fs = require('fs');
        if (fs.existsSync(driverPath)) {
          edgeDriverPath = driverPath;
          console.log('Found Edge WebDriver at:', driverPath);
          break;
        }
      }

      console.log('Building WebDriver instance...');
      const builder = new Builder()
        .forBrowser('MicrosoftEdge')
        .setEdgeOptions(edgeOptions);

      if (edgeDriverPath) {
        const service = new edge.ServiceBuilder(edgeDriverPath);
        builder.setEdgeService(service);
      }

      const driver = await builder.build();

      console.log('Setting timeouts and maximizing window...');
      await driver.manage().setTimeouts({ 
        implicit: config.implicitWait,
        pageLoad: 60000,
        script: 30000
      });
      
      if (!config.headless) {
        await driver.manage().window().maximize();
      }

      console.log('Edge driver created successfully');
      return driver;
    } catch (error) {
      console.error('\n❌ Failed to create Edge driver:', error.message);
      console.error('\nPossible causes:');
      console.error('1. Microsoft Edge WebDriver is not available');
      console.error('2. Edge version is incompatible');
      console.error('\nTroubleshooting steps:');
      console.error('1. Download Edge WebDriver from: https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/');
      console.error('2. Or install Chrome: https://www.google.com/chrome/ and run setup-browser again');
      console.error('\nFull error:', error);
      throw error;
    }
  }

  static async quitDriver(driver) {
    if (driver) {
      try {
        await driver.quit();
      } catch (error) {
        console.error('Error quitting driver:', error.message);
      }
    }
  }
}

module.exports = DriverFactory;
