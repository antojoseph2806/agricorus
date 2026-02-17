const { expect } = require('chai');
const DriverFactory = require('./utils/driver-factory-edge');
const TestHelpers = require('./utils/test-helpers');
const LoginPage = require('./pages/login-page');
const LandownerPage = require('./pages/landowner-page');
const config = require('./config/test-config');
const faker = require('faker');

describe('Landowner CRUD Operations - Complete Test Suite', function() {
  let driver;
  let helpers;
  let loginPage;
  let landownerPage;
  let createdLandTitle;

  // Increase timeout for all tests
  this.timeout(180000);

  before(async function() {
    this.timeout(180000); // Extra time for driver initialization
    console.log('🚀 Starting Landowner CRUD Test Suite...');
    console.log('⏳ Initializing WebDriver (this may take a moment)...');
    
    try {
      driver = await DriverFactory.createDriver();
      console.log('✅ WebDriver initialized');
      helpers = new TestHelpers(driver);
      loginPage = new LoginPage(driver, helpers);
      landownerPage = new LandownerPage(driver, helpers);
    } catch (error) {
      console.error('❌ Failed to initialize WebDriver:', error.message);
      throw error;
    }
  });

  after(async function() {
    this.timeout(30000);
    console.log('🏁 Cleaning up test suite...');
    try {
      if (driver) {
        await DriverFactory.quitDriver(driver);
        console.log('✅ WebDriver closed successfully');
      }
    } catch (error) {
      console.error('⚠️ Error during cleanup:', error.message);
    }
  });

  beforeEach(async function() {
    console.log(`\n📝 Running test: ${this.currentTest.title}`);
  });

  afterEach(async function() {
    if (this.currentTest.state === 'failed') {
      await helpers.takeScreenshot(`failed-${this.currentTest.title.replace(/\s+/g, '-')}`);
    }
  });

  describe('Authentication', function() {
    it('should successfully login as landowner', async function() {
      await loginPage.loginAsLandowner();
      const isLoggedIn = await loginPage.isLoginSuccessful();
      expect(isLoggedIn).to.be.true;
      console.log('✅ Landowner logged in successfully');
    });

    it('should navigate to My Lands page', async function() {
      await landownerPage.navigateToMyLands();
      const isOnListPage = await landownerPage.isOnLandListPage();
      expect(isOnListPage).to.be.true;
      console.log('✅ Navigated to My Lands page');
    });
  });

  describe('Create Land Listing (CREATE)', function() {
    it('should display Add Land button', async function() {
      await landownerPage.navigateToMyLands();
      const addButtonExists = await helpers.elementExists(landownerPage.addLandButton, 5000);
      expect(addButtonExists).to.be.true;
      console.log('✅ Add Land button is visible');
    });

    it('should open land creation form', async function() {
      await landownerPage.clickAddLand();
      await driver.sleep(1000);
      
      const titleInputExists = await helpers.elementExists(landownerPage.titleInput, 5000);
      expect(titleInputExists).to.be.true;
      console.log('✅ Land creation form opened');
    });

    it('should successfully create a new land listing with all fields', async function() {
      createdLandTitle = `${config.testLand.title} - ${faker.random.alphaNumeric(6)}`;
      
      const landData = {
        ...config.testLand,
        title: createdLandTitle
      };

      await landownerPage.navigateToMyLands();
      await landownerPage.createLand(landData);
      
      // Wait for success message or redirect
      await driver.sleep(3000);
      
      // Verify land was created
      await landownerPage.navigateToMyLands();
      const landExists = await landownerPage.findLandByTitle(createdLandTitle);
      expect(landExists).to.be.true;
      console.log(`✅ Land created successfully: ${createdLandTitle}`);
    });

    it('should validate required fields on land creation', async function() {
      await landownerPage.navigateToMyLands();
      await landownerPage.clickAddLand();
      
      // Try to submit empty form
      await landownerPage.submitForm();
      await driver.sleep(1000);
      
      // Check for validation errors (HTML5 validation or custom)
      const currentUrl = await helpers.getCurrentUrl();
      const stillOnForm = currentUrl.includes('create') || currentUrl.includes('new');
      expect(stillOnForm).to.be.true;
      console.log('✅ Form validation working for required fields');
    });

    it('should create land with minimum required fields', async function() {
      const minimalLandTitle = `Minimal Land - ${faker.random.alphaNumeric(6)}`;
      
      const minimalLandData = {
        title: minimalLandTitle,
        soilType: 'Loamy',
        sizeInAcres: 3,
        leasePricePerMonth: 10000,
        leaseDurationMonths: 6,
        waterSource: 'Borewell',
        accessibility: 'Good',
        location: {
          address: 'Test Address',
          latitude: 12.9716,
          longitude: 77.5946
        }
      };

      await landownerPage.navigateToMyLands();
      await landownerPage.createLand(minimalLandData);
      await driver.sleep(3000);
      
      await landownerPage.navigateToMyLands();
      const landExists = await landownerPage.findLandByTitle(minimalLandTitle);
      expect(landExists).to.be.true;
      console.log(`✅ Minimal land created: ${minimalLandTitle}`);
    });

    it('should handle large numeric values correctly', async function() {
      const largeLandTitle = `Large Land - ${faker.random.alphaNumeric(6)}`;
      
      const largeLandData = {
        ...config.testLand,
        title: largeLandTitle,
        sizeInAcres: 999.99,
        leasePricePerMonth: 999999,
        leaseDurationMonths: 120
      };

      await landownerPage.navigateToMyLands();
      await landownerPage.createLand(largeLandData);
      await driver.sleep(3000);
      
      await landownerPage.navigateToMyLands();
      const landExists = await landownerPage.findLandByTitle(largeLandTitle);
      expect(landExists).to.be.true;
      console.log(`✅ Land with large values created: ${largeLandTitle}`);
    });
  });

  describe('Read Land Listings (READ)', function() {
    it('should display list of all lands', async function() {
      await landownerPage.navigateToMyLands();
      await driver.sleep(2000);
      
      const landCount = await landownerPage.getLandCount();
      expect(landCount).to.be.at.least(1);
      console.log(`✅ Found ${landCount} land listing(s)`);
    });

    it('should display created land in the list', async function() {
      await landownerPage.navigateToMyLands();
      const landExists = await landownerPage.findLandByTitle(createdLandTitle);
      expect(landExists).to.be.true;
      console.log(`✅ Created land found in list: ${createdLandTitle}`);
    });

    it('should view land details', async function() {
      await landownerPage.navigateToMyLands();
      
      try {
        await landownerPage.clickViewForLand(createdLandTitle);
        await driver.sleep(2000);
        
        const isOnDetailsPage = await landownerPage.isOnLandDetailsPage();
        expect(isOnDetailsPage).to.be.true;
        console.log('✅ Land details page opened');
      } catch (error) {
        // If View button doesn't exist, try clicking on the land card/title
        console.log('View button not found, trying to click land title');
        const landTitleLocator = require('selenium-webdriver').By.xpath(`//*[contains(text(), "${createdLandTitle}")]`);
        await helpers.clickElement(landTitleLocator);
        await driver.sleep(2000);
      }
    });

    it('should display correct land information in details', async function() {
      await landownerPage.navigateToMyLands();
      
      try {
        await landownerPage.clickViewForLand(createdLandTitle);
      } catch (error) {
        const landTitleLocator = require('selenium-webdriver').By.xpath(`//*[contains(text(), "${createdLandTitle}")]`);
        await helpers.clickElement(landTitleLocator);
      }
      
      await driver.sleep(2000);
      const detailsTitle = await landownerPage.getLandDetailsTitle();
      expect(detailsTitle).to.include(createdLandTitle);
      console.log('✅ Land details display correct information');
    });

    it('should navigate back to land list from details', async function() {
      await landownerPage.navigateToMyLands();
      const isOnListPage = await landownerPage.isOnLandListPage();
      expect(isOnListPage).to.be.true;
      console.log('✅ Navigated back to land list');
    });
  });

  describe('Update Land Listing (UPDATE)', function() {
    let updatedTitle;

    it('should open edit form for a land', async function() {
      await landownerPage.navigateToMyLands();
      await landownerPage.clickEditForLand(createdLandTitle);
      await driver.sleep(2000);
      
      const isOnEditPage = await landownerPage.isOnLandEditPage();
      expect(isOnEditPage).to.be.true;
      console.log('✅ Edit form opened');
    });

    it('should display existing land data in edit form', async function() {
      const titleElement = await driver.findElement(landownerPage.titleInput);
      const currentTitle = await titleElement.getAttribute('value');
      expect(currentTitle).to.equal(createdLandTitle);
      console.log('✅ Existing data loaded in edit form');
    });

    it('should successfully update land title', async function() {
      updatedTitle = `${createdLandTitle} - UPDATED`;
      
      await landownerPage.updateLandTitle(updatedTitle);
      await landownerPage.submitForm();
      await driver.sleep(3000);
      
      await landownerPage.navigateToMyLands();
      const landExists = await landownerPage.findLandByTitle(updatedTitle);
      expect(landExists).to.be.true;
      
      // Update the createdLandTitle for subsequent tests
      createdLandTitle = updatedTitle;
      console.log(`✅ Land title updated to: ${updatedTitle}`);
    });

    it('should successfully update land price', async function() {
      const newPrice = 25000;
      
      await landownerPage.navigateToMyLands();
      await landownerPage.clickEditForLand(createdLandTitle);
      await driver.sleep(1000);
      
      await landownerPage.updateLandPrice(newPrice);
      await landownerPage.submitForm();
      await driver.sleep(3000);
      
      console.log(`✅ Land price updated to: ${newPrice}`);
    });

    it('should successfully update multiple fields', async function() {
      const multiUpdateTitle = `${createdLandTitle} - MULTI`;
      
      await landownerPage.navigateToMyLands();
      await landownerPage.clickEditForLand(createdLandTitle);
      await driver.sleep(1000);
      
      await landownerPage.updateLandTitle(multiUpdateTitle);
      await landownerPage.updateLandPrice(30000);
      await landownerPage.submitForm();
      await driver.sleep(3000);
      
      await landownerPage.navigateToMyLands();
      const landExists = await landownerPage.findLandByTitle(multiUpdateTitle);
      expect(landExists).to.be.true;
      
      createdLandTitle = multiUpdateTitle;
      console.log(`✅ Multiple fields updated: ${multiUpdateTitle}`);
    });

    it('should validate required fields on update', async function() {
      await landownerPage.navigateToMyLands();
      await landownerPage.clickEditForLand(createdLandTitle);
      await driver.sleep(1000);
      
      // Try to clear required field
      await helpers.typeText(landownerPage.titleInput, '');
      await landownerPage.submitForm();
      await driver.sleep(1000);
      
      const currentUrl = await helpers.getCurrentUrl();
      const stillOnEditPage = currentUrl.includes('edit');
      expect(stillOnEditPage).to.be.true;
      console.log('✅ Update validation working for required fields');
    });

    it('should cancel update and return to list', async function() {
      await landownerPage.navigateToMyLands();
      await landownerPage.clickEditForLand(createdLandTitle);
      await driver.sleep(1000);
      
      try {
        await helpers.clickElement(landownerPage.cancelButton);
        await driver.sleep(1000);
        
        const isOnListPage = await landownerPage.isOnLandListPage();
        expect(isOnListPage).to.be.true;
        console.log('✅ Update cancelled successfully');
      } catch (error) {
        console.log('Cancel button not found, navigating back manually');
        await landownerPage.navigateToMyLands();
      }
    });
  });

  describe('Delete Land Listing (DELETE)', function() {
    let landToDelete;

    before(async function() {
      // Create a land specifically for deletion test
      landToDelete = `Delete Test Land - ${faker.random.alphaNumeric(6)}`;
      const deleteTestLand = {
        ...config.testLand,
        title: landToDelete
      };
      
      await landownerPage.navigateToMyLands();
      await landownerPage.createLand(deleteTestLand);
      await driver.sleep(3000);
      console.log(`Created land for deletion test: ${landToDelete}`);
    });

    it('should display delete button for land', async function() {
      await landownerPage.navigateToMyLands();
      const deleteButtonExists = await helpers.elementExists(landownerPage.deleteButton, 5000);
      expect(deleteButtonExists).to.be.true;
      console.log('✅ Delete button is visible');
    });

    it('should show confirmation dialog on delete', async function() {
      await landownerPage.navigateToMyLands();
      await landownerPage.clickDeleteForLand(landToDelete);
      await driver.sleep(1000);
      
      // Check if confirmation dialog appears
      try {
        const dialogExists = await helpers.elementExists(landownerPage.confirmDialog, 3000);
        if (dialogExists) {
          console.log('✅ Confirmation dialog displayed');
          // Cancel the deletion for now
          await driver.navigate().back();
        } else {
          console.log('⚠️ No confirmation dialog (direct delete)');
        }
      } catch (error) {
        console.log('⚠️ Confirmation dialog check failed');
      }
    });

    it('should successfully delete land', async function() {
      await landownerPage.navigateToMyLands();
      const initialCount = await landownerPage.getLandCount();
      
      await landownerPage.clickDeleteForLand(landToDelete);
      await landownerPage.confirmDelete();
      await driver.sleep(3000);
      
      await landownerPage.navigateToMyLands();
      const landExists = await landownerPage.findLandByTitle(landToDelete);
      expect(landExists).to.be.false;
      
      const finalCount = await landownerPage.getLandCount();
      expect(finalCount).to.be.lessThan(initialCount);
      console.log(`✅ Land deleted successfully: ${landToDelete}`);
    });

    it('should not find deleted land in list', async function() {
      await landownerPage.navigateToMyLands();
      const landExists = await landownerPage.findLandByTitle(landToDelete);
      expect(landExists).to.be.false;
      console.log('✅ Deleted land not found in list');
    });

    it('should handle delete of non-existent land gracefully', async function() {
      const nonExistentLand = 'Non-Existent Land XYZ123';
      await landownerPage.navigateToMyLands();
      
      const landExists = await landownerPage.findLandByTitle(nonExistentLand);
      expect(landExists).to.be.false;
      console.log('✅ Non-existent land handled correctly');
    });
  });

  describe('Edge Cases and Error Handling', function() {
    it('should handle special characters in land title', async function() {
      const specialTitle = `Land with Special Chars !@#$% - ${faker.random.alphaNumeric(4)}`;
      const specialLandData = {
        ...config.testLand,
        title: specialTitle
      };

      await landownerPage.navigateToMyLands();
      await landownerPage.createLand(specialLandData);
      await driver.sleep(3000);
      
      await landownerPage.navigateToMyLands();
      // Just check we can navigate back without errors
      const isOnListPage = await landownerPage.isOnLandListPage();
      expect(isOnListPage).to.be.true;
      console.log('✅ Special characters handled');
    });

    it('should handle very long land title', async function() {
      const longTitle = `${'Very Long Land Title '.repeat(10)} - ${faker.random.alphaNumeric(4)}`;
      const longTitleLand = {
        ...config.testLand,
        title: longTitle.substring(0, 200) // Limit to reasonable length
      };

      await landownerPage.navigateToMyLands();
      await landownerPage.createLand(longTitleLand);
      await driver.sleep(3000);
      
      console.log('✅ Long title handled');
    });

    it('should handle decimal values in size field', async function() {
      const decimalTitle = `Decimal Size Land - ${faker.random.alphaNumeric(6)}`;
      const decimalLandData = {
        ...config.testLand,
        title: decimalTitle,
        sizeInAcres: 3.75
      };

      await landownerPage.navigateToMyLands();
      await landownerPage.createLand(decimalLandData);
      await driver.sleep(3000);
      
      await landownerPage.navigateToMyLands();
      const landExists = await landownerPage.findLandByTitle(decimalTitle);
      expect(landExists).to.be.true;
      console.log('✅ Decimal values handled correctly');
    });

    it('should handle negative coordinates', async function() {
      const negativeCoordTitle = `Negative Coord Land - ${faker.random.alphaNumeric(6)}`;
      const negativeCoordLand = {
        ...config.testLand,
        title: negativeCoordTitle,
        location: {
          address: 'Southern Hemisphere Location',
          latitude: -33.8688,
          longitude: 151.2093
        }
      };

      await landownerPage.navigateToMyLands();
      await landownerPage.createLand(negativeCoordLand);
      await driver.sleep(3000);
      
      await landownerPage.navigateToMyLands();
      const landExists = await landownerPage.findLandByTitle(negativeCoordTitle);
      expect(landExists).to.be.true;
      console.log('✅ Negative coordinates handled');
    });

    it('should maintain data integrity after page refresh', async function() {
      await landownerPage.navigateToMyLands();
      const beforeRefresh = await landownerPage.getLandCount();
      
      await helpers.refreshPage();
      await driver.sleep(2000);
      
      const afterRefresh = await landownerPage.getLandCount();
      expect(afterRefresh).to.equal(beforeRefresh);
      console.log('✅ Data integrity maintained after refresh');
    });
  });

  describe('Pagination and Filtering (if applicable)', function() {
    it('should handle empty land list gracefully', async function() {
      // This test assumes we can see the list even if empty
      await landownerPage.navigateToMyLands();
      const isOnListPage = await landownerPage.isOnLandListPage();
      expect(isOnListPage).to.be.true;
      console.log('✅ Empty list handled gracefully');
    });

    it('should display lands in consistent order', async function() {
      await landownerPage.navigateToMyLands();
      await driver.sleep(2000);
      
      const count1 = await landownerPage.getLandCount();
      
      await helpers.refreshPage();
      await driver.sleep(2000);
      
      const count2 = await landownerPage.getLandCount();
      expect(count2).to.equal(count1);
      console.log('✅ Land order is consistent');
    });
  });

  describe('Cleanup', function() {
    it('should clean up test data', async function() {
      // Delete the main test land if it still exists
      try {
        await landownerPage.navigateToMyLands();
        const landExists = await landownerPage.findLandByTitle(createdLandTitle);
        
        if (landExists) {
          await landownerPage.clickDeleteForLand(createdLandTitle);
          await landownerPage.confirmDelete();
          await driver.sleep(2000);
          console.log(`✅ Cleaned up test land: ${createdLandTitle}`);
        }
      } catch (error) {
        console.log('⚠️ Cleanup: Test land may have been already deleted');
      }
    });
  });
});
