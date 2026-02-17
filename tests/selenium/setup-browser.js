#!/usr/bin/env node

/**
 * Browser detection and setup script
 * Detects available browsers and configures the test suite accordingly
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function checkBrowser(name, paths) {
  for (const browserPath of paths) {
    try {
      if (fs.existsSync(browserPath)) {
        console.log(`✅ Found ${name} at: ${browserPath}`);
        return { name, path: browserPath, available: true };
      }
    } catch (error) {
      // Continue checking
    }
  }
  return { name, available: false };
}

function detectBrowsers() {
  console.log('🔍 Detecting available browsers...\n');

  const browsers = {
    chrome: checkBrowser('Google Chrome', [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe')
    ]),
    edge: checkBrowser('Microsoft Edge', [
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
    ])
  };

  return browsers;
}

function updateDriverFactory(browser) {
  const testFile = path.join(__dirname, 'landowner-crud.test.js');
  let content = fs.readFileSync(testFile, 'utf8');

  if (browser === 'edge') {
    // Update to use Edge driver factory
    content = content.replace(
      "const DriverFactory = require('./utils/driver-factory');",
      "const DriverFactory = require('./utils/driver-factory-edge');"
    );
    fs.writeFileSync(testFile, content);
    console.log('✅ Updated test to use Microsoft Edge');
  } else {
    // Ensure it uses Chrome driver factory
    content = content.replace(
      "const DriverFactory = require('./utils/driver-factory-edge');",
      "const DriverFactory = require('./utils/driver-factory');"
    );
    fs.writeFileSync(testFile, content);
    console.log('✅ Updated test to use Google Chrome');
  }
}

function main() {
  const browsers = detectBrowsers();

  console.log('\n' + '='.repeat(50));

  if (browsers.chrome.available) {
    console.log('\n✅ Google Chrome is available');
    console.log('📦 Make sure chromedriver is installed: npm install chromedriver');
    updateDriverFactory('chrome');
  } else if (browsers.edge.available) {
    console.log('\n✅ Microsoft Edge is available');
    console.log('📦 Installing msedgedriver...');
    try {
      execSync('npm install msedgedriver', { stdio: 'inherit' });
      updateDriverFactory('edge');
      console.log('✅ Setup complete! You can now run tests with Microsoft Edge');
    } catch (error) {
      console.error('❌ Failed to install msedgedriver');
      process.exit(1);
    }
  } else {
    console.log('\n❌ No compatible browser found!');
    console.log('\nPlease install one of the following:');
    console.log('1. Google Chrome: https://www.google.com/chrome/');
    console.log('2. Microsoft Edge: https://www.microsoft.com/edge');
    console.log('\nAfter installation, run this script again: npm run setup-browser');
    process.exit(1);
  }

  console.log('\n' + '='.repeat(50));
  console.log('\n✅ Browser setup complete!');
  console.log('You can now run tests with: npm test\n');
}

main();
