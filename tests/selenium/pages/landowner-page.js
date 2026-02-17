const { By } = require('selenium-webdriver');
const config = require('../config/test-config');
const path = require('path');

class LandownerPage {
  constructor(driver, helpers) {
    this.driver = driver;
    this.helpers = helpers;
    
    // Navigation Locators
    this.myLandsLink = By.xpath('//a[contains(text(), "My Lands") or contains(text(), "My Land") or contains(@href, "/lands")]');
    this.addLandButton = By.xpath('//button[contains(text(), "List New Land") or contains(text(), "List Your First Land")]');
    
    // Form Locators (AddLand uses IDs, EditLand uses names)
    this.titleInput = By.css('input#title, input[name="title"]');
    this.soilTypeInput = By.css('input#soilType, input[name="soilType"]');
    this.waterSourceInput = By.css('input#waterSource, input[name="waterSource"]');
    this.accessibilityInput = By.css('input#accessibility, input[name="accessibility"]');
    this.sizeInput = By.css('input#sizeInAcres, input[name="sizeInAcres"]');
    this.priceInput = By.css('input#leasePricePerMonth, input[name="leasePricePerMonth"]');
    this.durationInput = By.css('input#leaseDurationMonths, input[name="leaseDurationMonths"]');
    this.addressInput = By.css('input#location\\.address, input[name="location.address"]');
    this.latitudeInput = By.css('input#location\\.latitude, input[name="location.latitude"]');
    this.longitudeInput = By.css('input#location\\.longitude, input[name="location.longitude"]');
    this.photosInput = By.css('input#photo-upload-input, input#photo-upload');
    this.documentsInput = By.css('input#document-upload-input, input#document-upload');
    this.submitButton = By.xpath('//button[contains(text(), "List Land") or contains(text(), "Update Land Configuration")]');
    this.cancelButton = By.xpath('//button[contains(text(), "Cancel")]');
    
    // List View Locators
    this.landCards = By.css('div.bg-white.rounded-3xl');
    this.landTable = By.css('table, [class*="table"]');
    this.landRows = By.css('tbody tr, [class*="land-row"]');
    this.editButton = By.xpath('//button[contains(text(), "Edit")]');
    this.deleteButton = By.xpath('//button[contains(text(), "Delete")]');
    this.viewButton = By.xpath('//button[contains(text(), "View Details")]');
    
    // Detail View Locators
    this.landTitle = By.css('h1, h2, h3');
    this.landDetails = By.css('[class*="detail"], [class*="info"]');
    
    // Messages
    this.successMessage = By.css('.success, .alert-success, [class*="success"]');
    this.errorMessage = By.css('.error, .alert-danger, [class*="error"]');
    this.confirmDialog = By.css('[role="dialog"], .modal, [class*="confirm"]');
    this.confirmYesButton = By.xpath('//button[contains(text(), "Yes") or contains(text(), "Confirm") or contains(text(), "OK")]');
  }

  async navigateToMyLands() {
    await this.helpers.navigateTo(`${config.baseUrl}/lands/view`);
    await this.driver.sleep(1000);
  }

  async clickAddLand() {
    try {
      // Scroll to top first to avoid interception
      await this.driver.executeScript('window.scrollTo(0, 0);');
      await this.driver.sleep(500);
      
      // Use JavaScript click to bypass interception
      const button = await this.driver.findElement(this.addLandButton);
      await this.driver.executeScript('arguments[0].click();', button);
      await this.driver.sleep(1000);
    } catch (error) {
      console.log('Failed to click Add Land button, navigating directly:', error.message);
      // Try navigating directly to add page
      await this.helpers.navigateTo(`${config.baseUrl}/lands/add`);
      await this.driver.sleep(1000);
    }
  }

  async fillLandForm(landData) {
    // Fill basic information
    await this.helpers.typeText(this.titleInput, landData.title);
    
    // Handle soil type
    try {
      await this.helpers.typeText(this.soilTypeInput, landData.soilType);
    } catch (error) {
      console.log('Soil type field not found or error:', error.message);
    }
    
    // Handle water source
    try {
      await this.helpers.typeText(this.waterSourceInput, landData.waterSource);
    } catch (error) {
      console.log('Water source field not found or error:', error.message);
    }
    
    try {
      await this.helpers.typeText(this.accessibilityInput, landData.accessibility);
    } catch (error) {
      console.log('Accessibility field not found or error:', error.message);
    }
    
    await this.helpers.typeText(this.sizeInput, landData.sizeInAcres.toString());
    await this.helpers.typeText(this.priceInput, landData.leasePricePerMonth.toString());
    await this.helpers.typeText(this.durationInput, landData.leaseDurationMonths.toString());
    
    // Fill location information
    if (landData.location) {
      await this.helpers.typeText(this.addressInput, landData.location.address);
      await this.helpers.typeText(this.latitudeInput, landData.location.latitude.toString());
      await this.helpers.typeText(this.longitudeInput, landData.location.longitude.toString());
    }
  }

  async uploadLandPhotos(photosPaths) {
    if (!photosPaths || photosPaths.length === 0) return;
    
    try {
      const photosElement = await this.driver.findElement(this.photosInput);
      for (const photoPath of photosPaths) {
        const absolutePath = path.resolve(photoPath);
        await photosElement.sendKeys(absolutePath);
      }
    } catch (error) {
      console.log('Photos upload field not found or error:', error.message);
    }
  }

  async uploadLandDocuments(documentsPaths) {
    if (!documentsPaths || documentsPaths.length === 0) return;
    
    try {
      const documentsElement = await this.driver.findElement(this.documentsInput);
      for (const docPath of documentsPaths) {
        const absolutePath = path.resolve(docPath);
        await documentsElement.sendKeys(absolutePath);
      }
    } catch (error) {
      console.log('Documents upload field not found or error:', error.message);
    }
  }

  async submitForm() {
    await this.helpers.clickElement(this.submitButton);
    await this.driver.sleep(2000);
  }

  async createLand(landData, photosPaths = [], documentsPaths = []) {
    await this.clickAddLand();
    await this.fillLandForm(landData);
    await this.uploadLandPhotos(photosPaths);
    await this.uploadLandDocuments(documentsPaths);
    await this.submitForm();
  }

  async getLandCount() {
    try {
      const cards = await this.driver.findElements(this.landCards);
      if (cards.length > 0) return cards.length;
      
      const rows = await this.driver.findElements(this.landRows);
      return rows.length;
    } catch (error) {
      return 0;
    }
  }

  async findLandByTitle(title) {
    try {
      // Look for title in h3 elements (your UI uses h3 for land titles)
      const landLocator = By.xpath(`//h3[contains(text(), "${title}")]`);
      return await this.helpers.elementExists(landLocator, 5000);
    } catch (error) {
      return false;
    }
  }

  async clickEditForLand(title) {
    try {
      // Strategy 1: Find by title and then navigate to edit button in same card
      const landLocator = By.xpath(`//h3[contains(text(), "${title}")]/ancestor::div[contains(@class, "bg-white")]//button[contains(text(), "Edit")]`);
      await this.helpers.clickElement(landLocator);
    } catch (error) {
      // Strategy 2: Find all cards and click edit in the matching one
      console.log('First strategy failed, trying alternative...');
      const cards = await this.driver.findElements(By.css('div.bg-white.rounded-3xl'));
      for (const card of cards) {
        const cardText = await card.getText();
        if (cardText.includes(title)) {
          const editBtn = await card.findElement(By.xpath('.//button[contains(text(), "Edit")]'));
          await this.driver.executeScript('arguments[0].scrollIntoView(true);', editBtn);
          await this.driver.sleep(300);
          await this.driver.executeScript('arguments[0].click();', editBtn);
          break;
        }
      }
    }
    await this.driver.sleep(1000);
  }

  async clickDeleteForLand(title) {
    try {
      // Strategy 1: Find by title and then navigate to delete button in same card
      const landLocator = By.xpath(`//h3[contains(text(), "${title}")]/ancestor::div[contains(@class, "bg-white")]//button[contains(text(), "Delete")]`);
      await this.helpers.clickElement(landLocator);
    } catch (error) {
      // Strategy 2: Find all cards and click delete in the matching one
      console.log('First strategy failed, trying alternative...');
      const cards = await this.driver.findElements(By.css('div.bg-white.rounded-3xl'));
      for (const card of cards) {
        const cardText = await card.getText();
        if (cardText.includes(title)) {
          const deleteBtn = await card.findElement(By.xpath('.//button[contains(text(), "Delete")]'));
          await this.driver.executeScript('arguments[0].scrollIntoView(true);', deleteBtn);
          await this.driver.sleep(300);
          await this.driver.executeScript('arguments[0].click();', deleteBtn);
          break;
        }
      }
    }
    await this.driver.sleep(1000);
  }

  async clickViewForLand(title) {
    try {
      // Strategy 1: Find by title and then navigate to view button in same card
      const landLocator = By.xpath(`//h3[contains(text(), "${title}")]/ancestor::div[contains(@class, "bg-white")]//button[contains(text(), "View Details")]`);
      await this.helpers.clickElement(landLocator);
    } catch (error) {
      // Strategy 2: Find all cards and click view in the matching one
      console.log('First strategy failed, trying alternative...');
      const cards = await this.driver.findElements(By.css('div.bg-white.rounded-3xl'));
      for (const card of cards) {
        const cardText = await card.getText();
        if (cardText.includes(title)) {
          const viewBtn = await card.findElement(By.xpath('.//button[contains(text(), "View Details")]'));
          await this.driver.executeScript('arguments[0].scrollIntoView(true);', viewBtn);
          await this.driver.sleep(300);
          await this.driver.executeScript('arguments[0].click();', viewBtn);
          break;
        }
      }
    }
    await this.driver.sleep(1000);
  }

  async updateLandTitle(newTitle) {
    const element = await this.driver.findElement(this.titleInput);
    // Clear using multiple methods for reliability
    await element.clear();
    await this.driver.sleep(200);
    await element.sendKeys(newTitle);
  }

  async updateLandPrice(newPrice) {
    const element = await this.driver.findElement(this.priceInput);
    // Clear using multiple methods for reliability
    await element.clear();
    await this.driver.sleep(200);
    await element.sendKeys(newPrice.toString());
  }

  async confirmDelete() {
    try {
      // Browser's window.confirm - accept it
      await this.driver.sleep(500);
      const alert = await this.driver.switchTo().alert();
      await alert.accept();
      await this.driver.sleep(2000);
    } catch (error) {
      // No alert, might be a modal dialog
      try {
        await this.helpers.waitForElement(this.confirmDialog, 3000);
        await this.helpers.clickElement(this.confirmYesButton);
        await this.driver.sleep(2000);
      } catch (err) {
        console.log('No confirmation dialog found');
      }
    }
  }

  async getSuccessMessage() {
    try {
      return await this.helpers.getText(this.successMessage, 5000);
    } catch (error) {
      return null;
    }
  }

  async getErrorMessage() {
    try {
      return await this.helpers.getText(this.errorMessage, 5000);
    } catch (error) {
      return null;
    }
  }

  async getLandDetailsTitle() {
    try {
      // Look for h1, h2, or h3 with land title
      const titleLocator = By.css('h1, h2, h3');
      return await this.helpers.getText(titleLocator, 5000);
    } catch (error) {
      return null;
    }
  }

  async isOnLandDetailsPage() {
    const currentUrl = await this.helpers.getCurrentUrl();
    return currentUrl.includes('/landowner/lands/view/');
  }

  async isOnLandEditPage() {
    const currentUrl = await this.helpers.getCurrentUrl();
    return currentUrl.includes('/landowner/lands/edit/');
  }

  async isOnLandListPage() {
    const currentUrl = await this.helpers.getCurrentUrl();
    return currentUrl.includes('/lands/view') && 
           !currentUrl.includes('/landowner/lands/view/') && 
           !currentUrl.includes('/landowner/lands/edit/') &&
           !currentUrl.includes('/lands/add');
  }
}

module.exports = LandownerPage;
