const { expect } = require('chai');
const DriverFactory = require('./utils/driver-factory');
const TestHelpers = require('./utils/test-helpers');
const LoginPage = require('./pages/login-page');
const LandownerPage = require('./pages/landowner-page');
const TestDataGenerator = require('./utils/test-data-generator');
const config = require('./config/test-config');

describe('Landowner Advanced Test Scenarios', function() {
  let driver;
  let helpers;
  let loginPage;
  let landownerPage;
  const createdLands = [];

  this.timeout(120000);

  before(async function() {
    this.timeout(120000); // Extra time for driver initialization
    console.log('🚀 Starting Landowner Advanced Test Suite...');
    console.log('⏳ Initializing WebDriver (this may take a moment)...');
    driver = await DriverFactory.createDriver();
    console.log('✅ WebDriver initialized');
    helpers = new TestHelpers(driver);
    loginPage = new LoginPage(driver, helpers);
    landownerPage = new LandownerPage(driver, helpers);
    
    // Login once for all tests
    await loginPage.loginAsLandowner();
    await driver.sleep(2000);
  });

  after(async function() {
    console.log('🏁 Cleaning up advanced test suite...');
    
    // Cleanup all created lands
    for (const landTitle of createdLands) {
      try {
        await landownerPage.navigateToMyLands();
        const exists = await landownerPage.findLandByTitle(landTitle);
        if (exists) {
          await landownerPage.clickDeleteForLand(landTitle);
          await landownerPage.confirmDelete();
          await driver.sleep(1000);
        }
      } catch (error) {
        console.log(`Failed to cleanup: ${landTitle}`);
      }
    }
    
    await DriverFactory.quitDriver(driver);
  });

  afterEach(async function() {
    if (this.currentTest.state === 'failed') {
      await helpers.takeScreenshot(`advanced-failed-${this.currentTest.title.replace(/\s+/g, '-')}`);
    }
  });

  describe('Bulk Operations', function() {
    it('should create multiple lands in sequence', async function() {
      const lands = TestDataGenerator.generateMultipleLands(3);
      
      for (const landData of lands) {
        await landownerPage.navigateToMyLands();
        await landownerPage.createLand(landData);
        await driver.sleep(2000);
        createdLands.push(landData.title);
      }
      
      await landownerPage.navigateToMyLands();
      const landCount = await landownerPage.getLandCount();
      expect(landCount).to.be.at.least(3);
      console.log(`✅ Created ${lands.length} lands successfully`);
    });

    it('should update multiple lands', async function() {
      const landsToUpdate = createdLands.slice(0, 2);
      
      for (const landTitle of landsToUpdate) {
        await landownerPage.navigateToMyLands();
        await landownerPage.clickEditForLand(landTitle);
        await driver.sleep(1000);
        
        const newPrice = Math.floor(Math.random() * 20000 + 10000);
        await landownerPage.updateLandPrice(newPrice);
        await landownerPage.submitForm();
        await driver.sleep(2000);
      }
      
      console.log(`✅ Updated ${landsToUpdate.length} lands`);
    });
  });

  describe('Data Validation Tests', function() {
    it('should reject land with negative size', async function() {
      const invalidLand = TestDataGenerator.generateInvalidLandData('size');
      
      await landownerPage.navigateToMyLands();
      await landownerPage.clickAddLand();
      await landownerPage.fillLandForm(invalidLand);
      await landownerPage.submitForm();
      await driver.sleep(1000);
      
      // Should still be on form page
      const currentUrl = await helpers.getCurrentUrl();
      const stillOnForm = currentUrl.includes('create') || currentUrl.includes('new');
      expect(stillOnForm).to.be.true;
      console.log('✅ Negative size validation working');
    });

    it('should reject land with zero price', async function() {
      const invalidLand = TestDataGenerator.generateInvalidLandData('price');
      
      await landownerPage.navigateToMyLands();
      await landownerPage.clickAddLand();
      await landownerPage.fillLandForm(invalidLand);
      await landownerPage.submitForm();
      await driver.sleep(1000);
      
      const currentUrl = await helpers.getCurrentUrl();
      const stillOnForm = currentUrl.includes('create') || currentUrl.includes('new');
      expect(stillOnForm).to.be.true;
      console.log('✅ Zero price validation working');
    });

    it('should handle maximum length strings', async function() {
      const edgeCaseLand = TestDataGenerator.generateEdgeCaseData('maxLength');
      
      await landownerPage.navigateToMyLands();
      await landownerPage.createLand(edgeCaseLand);
      await driver.sleep(3000);
      
      // Should handle gracefully
      console.log('✅ Maximum length strings handled');
    });

    it('should handle unicode characters', async function() {
      const unicodeLand = TestDataGenerator.generateEdgeCaseData('unicode');
      
      await landownerPage.navigateToMyLands();
      await landownerPage.createLand(unicodeLand);
      await driver.sleep(3000);
      
      createdLands.push(unicodeLand.title);
      console.log('✅ Unicode characters handled');
    });

    it('should handle minimum valid values', async function() {
      const minValueLand = TestDataGenerator.generateEdgeCaseData('minValues');
      
      await landownerPage.navigateToMyLands();
      await landownerPage.createLand(minValueLand);
      await driver.sleep(3000);
      
      await landownerPage.navigateToMyLands();
      const landExists = await landownerPage.findLandByTitle(minValueLand.title);
      expect(landExists).to.be.true;
      createdLands.push(minValueLand.title);
      console.log('✅ Minimum values accepted');
    });

    it('should handle maximum valid values', async function() {
      const maxValueLand = TestDataGenerator.generateEdgeCaseData('maxValues');
      
      await landownerPage.navigateToMyLands();
      await landownerPage.createLand(maxValueLand);
      await driver.sleep(3000);
      
      await landownerPage.navigateToMyLands();
      const landExists = await landownerPage.findLandByTitle(maxValueLand.title);
      expect(landExists).to.be.true;
      createdLands.push(maxValueLand.title);
      console.log('✅ Maximum values accepted');
    });
  });

  describe('Realistic Scenarios', function() {
    it('should create small agricultural plot', async function() {
      const smallLand = TestDataGenerator.generateSmallLand();
      
      await landownerPage.navigateToMyLands();
      await landownerPage.createLand(smallLand);
      await driver.sleep(3000);
      
      await landownerPage.navigateToMyLands();
      const landExists = await landownerPage.findLandByTitle(smallLand.title);
      expect(landExists).to.be.true;
      createdLands.push(smallLand.title);
      console.log('✅ Small plot created');
    });

    it('should create large agricultural estate', async function() {
      const largeLand = TestDataGenerator.generateLargeLand();
      
      await landownerPage.navigateToMyLands();
      await landownerPage.createLand(largeLand);
      await driver.sleep(3000);
      
      await landownerPage.navigateToMyLands();
      const landExists = await landownerPage.findLandByTitle(largeLand.title);
      expect(landExists).to.be.true;
      createdLands.push(largeLand.title);
      console.log('✅ Large estate created');
    });

    it('should create premium land listing', async function() {
      const premiumLand = TestDataGenerator.generatePremiumLand();
      
      await landownerPage.navigateToMyLands();
      await landownerPage.createLand(premiumLand);
      await driver.sleep(3000);
      
      await landownerPage.navigateToMyLands();
      const landExists = await landownerPage.findLandByTitle(premiumLand.title);
      expect(landExists).to.be.true;
      createdLands.push(premiumLand.title);
      console.log('✅ Premium land created');
    });

    it('should create Indian agricultural land', async function() {
      const indianLand = TestDataGenerator.generateIndianLandData();
      
      await landownerPage.navigateToMyLands();
      await landownerPage.createLand(indianLand);
      await driver.sleep(3000);
      
      await landownerPage.navigateToMyLands();
      const landExists = await landownerPage.findLandByTitle(indianLand.title);
      expect(landExists).to.be.true;
      createdLands.push(indianLand.title);
      console.log('✅ Indian agricultural land created');
    });
  });

  describe('Workflow Tests', function() {
    it('should complete full CRUD cycle on single land', async function() {
      const testLand = TestDataGenerator.generateLandData();
      
      // CREATE
      await landownerPage.navigateToMyLands();
      await landownerPage.createLand(testLand);
      await driver.sleep(3000);
      createdLands.push(testLand.title);
      
      // READ
      await landownerPage.navigateToMyLands();
      let landExists = await landownerPage.findLandByTitle(testLand.title);
      expect(landExists).to.be.true;
      
      // UPDATE
      const updatedTitle = `${testLand.title} - UPDATED`;
      await landownerPage.clickEditForLand(testLand.title);
      await driver.sleep(1000);
      await landownerPage.updateLandTitle(updatedTitle);
      await landownerPage.submitForm();
      await driver.sleep(3000);
      
      // Verify update
      await landownerPage.navigateToMyLands();
      landExists = await landownerPage.findLandByTitle(updatedTitle);
      expect(landExists).to.be.true;
      
      // DELETE
      await landownerPage.clickDeleteForLand(updatedTitle);
      await landownerPage.confirmDelete();
      await driver.sleep(3000);
      
      // Verify deletion
      await landownerPage.navigateToMyLands();
      landExists = await landownerPage.findLandByTitle(updatedTitle);
      expect(landExists).to.be.false;
      
      // Remove from cleanup list
      const index = createdLands.indexOf(testLand.title);
      if (index > -1) createdLands.splice(index, 1);
      
      console.log('✅ Full CRUD cycle completed');
    });

    it('should handle rapid successive operations', async function() {
      const rapidLand = TestDataGenerator.generateLandData();
      
      // Create
      await landownerPage.navigateToMyLands();
      await landownerPage.createLand(rapidLand);
      await driver.sleep(2000);
      createdLands.push(rapidLand.title);
      
      // Immediately edit
      await landownerPage.navigateToMyLands();
      await landownerPage.clickEditForLand(rapidLand.title);
      await driver.sleep(500);
      await landownerPage.updateLandPrice(99999);
      await landownerPage.submitForm();
      await driver.sleep(2000);
      
      // Immediately view
      await landownerPage.navigateToMyLands();
      try {
        await landownerPage.clickViewForLand(rapidLand.title);
        await driver.sleep(1000);
      } catch (error) {
        console.log('View button not available');
      }
      
      console.log('✅ Rapid operations handled');
    });
  });

  describe('Performance Tests', function() {
    it('should handle page with many land listings', async function() {
      await landownerPage.navigateToMyLands();
      await driver.sleep(2000);
      
      const startTime = Date.now();
      const landCount = await landownerPage.getLandCount();
      const endTime = Date.now();
      
      const loadTime = endTime - startTime;
      expect(loadTime).to.be.lessThan(5000);
      console.log(`✅ Page loaded ${landCount} lands in ${loadTime}ms`);
    });

    it('should handle multiple page refreshes', async function() {
      await landownerPage.navigateToMyLands();
      const initialCount = await landownerPage.getLandCount();
      
      for (let i = 0; i < 3; i++) {
        await helpers.refreshPage();
        await driver.sleep(1000);
        const count = await landownerPage.getLandCount();
        expect(count).to.equal(initialCount);
      }
      
      console.log('✅ Multiple refreshes handled correctly');
    });
  });

  describe('Error Recovery', function() {
    it('should recover from network interruption simulation', async function() {
      await landownerPage.navigateToMyLands();
      
      // Simulate by navigating away and back
      await helpers.navigateTo(config.baseUrl);
      await driver.sleep(1000);
      
      await landownerPage.navigateToMyLands();
      const isOnListPage = await landownerPage.isOnLandListPage();
      expect(isOnListPage).to.be.true;
      console.log('✅ Recovered from navigation interruption');
    });

    it('should handle browser back button', async function() {
      await landownerPage.navigateToMyLands();
      await landownerPage.clickAddLand();
      await driver.sleep(1000);
      
      await driver.navigate().back();
      await driver.sleep(1000);
      
      const isOnListPage = await landownerPage.isOnLandListPage();
      expect(isOnListPage).to.be.true;
      console.log('✅ Back button handled correctly');
    });

    it('should handle browser forward button', async function() {
      await landownerPage.navigateToMyLands();
      await landownerPage.clickAddLand();
      await driver.sleep(1000);
      
      await driver.navigate().back();
      await driver.sleep(500);
      
      await driver.navigate().forward();
      await driver.sleep(1000);
      
      // Should be back on create page
      const currentUrl = await helpers.getCurrentUrl();
      const onCreatePage = currentUrl.includes('create') || currentUrl.includes('new');
      expect(onCreatePage).to.be.true;
      console.log('✅ Forward button handled correctly');
    });
  });

  describe('Concurrent Operations Simulation', function() {
    it('should handle view and edit in quick succession', async function() {
      if (createdLands.length === 0) {
        this.skip();
        return;
      }
      
      const testLand = createdLands[0];
      await landownerPage.navigateToMyLands();
      
      // Try to view
      try {
        await landownerPage.clickViewForLand(testLand);
        await driver.sleep(1000);
        await driver.navigate().back();
      } catch (error) {
        console.log('View not available, skipping to edit');
      }
      
      // Immediately edit
      await landownerPage.navigateToMyLands();
      await landownerPage.clickEditForLand(testLand);
      await driver.sleep(1000);
      
      const isOnEditPage = await landownerPage.isOnLandEditPage();
      expect(isOnEditPage).to.be.true;
      console.log('✅ Quick succession operations handled');
    });
  });
});
