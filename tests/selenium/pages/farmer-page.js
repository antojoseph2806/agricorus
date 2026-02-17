const { By } = require('selenium-webdriver');
const config = require('../config/test-config');

class FarmerPage {
  constructor(driver, helpers) {
    this.driver = driver;
    this.helpers = helpers;
    
    // Navigation Locators
    this.myProjectsLink = By.xpath('//a[contains(text(), "Projects") or contains(@href, "/farmer/projects")]');
    this.addProjectButton = By.xpath('//button[contains(text(), "New Project") or contains(text(), "Create Project")]');
    
    // Form Locators - Step 1: Basic Info
    this.titleInput = By.css('input[placeholder*="Project Title" i], input[placeholder*="Organic" i]');
    this.descriptionTextarea = By.css('textarea[placeholder*="Describe your project" i]');
    this.cropTypeInput = By.css('input[placeholder*="Tomatoes" i], input[placeholder*="Wheat" i], input[placeholder*="Corn" i]');
    this.fundingGoalInput = By.css('input[type="number"][placeholder*="50000" i]');
    this.endDateInput = By.css('input[type="date"]');
    
    // Form Locators - Step 2: Farmer Verification
    this.aadhaarNumberInput = By.css('input[placeholder*="12-digit Aadhaar" i]');
    this.aadhaarDocumentInput = By.css('input[type="file"][accept*=".pdf"]');
    this.govtIdTypeSelect = By.css('select');
    this.govtIdNumberInput = By.css('input[placeholder*="ID number" i]');
    this.govtIdDocumentInput = By.xpath('(//input[@type="file"])[2]');
    
    // Form Locators - Step 3: Land Details
    this.stateInput = By.css('input[placeholder*="Karnataka" i]');
    this.districtInput = By.css('input[placeholder*="Bangalore" i]');
    this.tehsilInput = By.css('input[placeholder*="Devanahalli" i]');
    this.villageInput = By.css('input[placeholder*="Chikkajala" i]');
    this.panchayatInput = By.css('input[placeholder*="Panchayat" i]');
    this.pincodeInput = By.css('input[placeholder*="562110" i], input[maxlength="6"]');
    this.surveyNumberInput = By.css('input[placeholder*="123/4A" i]');
    this.landAreaValueInput = By.css('input[type="number"][placeholder*="2.5" i]');
    this.landAreaUnitSelect = By.xpath('//select[.//option[contains(text(), "Acre")]]');
    this.landTypeSelect = By.xpath('//select[.//option[contains(text(), "Agricultural")]]');
    this.latitudeInput = By.css('input[placeholder*="latitude" i]');
    this.longitudeInput = By.css('input[placeholder*="longitude" i]');
    
    // Navigation Buttons
    this.nextButton = By.xpath('//button[contains(text(), "Next") or contains(text(), "Continue")]');
    this.prevButton = By.xpath('//button[contains(text(), "Previous") or contains(text(), "Back")]');
    this.submitButton = By.xpath('//button[contains(text(), "Submit") or contains(text(), "Create Project")]');
    
    // List View Locators
    this.projectCards = By.css('div.group.bg-white.rounded-xl');
    this.editButton = By.xpath('//button[@title="Edit project"]');
    this.deleteButton = By.xpath('//button[@title="Delete project"]');
    this.viewButton = By.xpath('//button[contains(text(), "View Details")]');
    
    // Search and Filters
    this.searchInput = By.css('input[placeholder*="Search projects" i]');
    this.statusFilter = By.xpath('//select[.//option[contains(text(), "All Status")]]');
    this.verificationFilter = By.xpath('//select[.//option[contains(text(), "All Verification")]]');
    
    // Messages
    this.successMessage = By.css('.success, .alert-success, [class*="success"]');
    this.errorMessage = By.css('.error, .alert-danger, [class*="error"]');
  }

  async navigateToMyProjects() {
    await this.helpers.navigateTo(`${config.baseUrl}/farmer/projects`);
    await this.driver.sleep(1000);
  }

  async clickAddProject() {
    try {
      await this.driver.executeScript('window.scrollTo(0, 0);');
      await this.driver.sleep(500);
      const button = await this.driver.findElement(this.addProjectButton);
      await this.driver.executeScript('arguments[0].click();', button);
      await this.driver.sleep(1000);
    } catch (error) {
      console.log('Failed to click Add Project button, navigating directly');
      await this.helpers.navigateTo(`${config.baseUrl}/farmer/projects/add`);
      await this.driver.sleep(1000);
    }
  }

  async fillBasicInfo(projectData) {
    await this.helpers.typeText(this.titleInput, projectData.title);
    await this.helpers.typeText(this.descriptionTextarea, projectData.description);
    if (projectData.cropType) {
      await this.helpers.typeText(this.cropTypeInput, projectData.cropType);
    }
    await this.helpers.typeText(this.fundingGoalInput, projectData.fundingGoal.toString());
    await this.helpers.typeText(this.endDateInput, projectData.endDate);
  }

  async fillFarmerVerification(verificationData) {
    await this.helpers.typeText(this.aadhaarNumberInput, verificationData.aadhaarNumber);
    
    // Select govt ID type
    const govtIdSelect = await this.driver.findElement(this.govtIdTypeSelect);
    await govtIdSelect.click();
    await this.driver.sleep(300);
    const option = await govtIdSelect.findElement(By.xpath(`.//option[@value="${verificationData.govtIdType}"]`));
    await option.click();
    
    await this.helpers.typeText(this.govtIdNumberInput, verificationData.govtIdNumber);
  }

  async fillLandDetails(landData) {
    await this.helpers.typeText(this.stateInput, landData.state);
    await this.helpers.typeText(this.districtInput, landData.district);
    await this.helpers.typeText(this.tehsilInput, landData.tehsil);
    await this.helpers.typeText(this.villageInput, landData.village);
    await this.helpers.typeText(this.panchayatInput, landData.panchayat);
    await this.helpers.typeText(this.pincodeInput, landData.pincode);
    await this.helpers.typeText(this.surveyNumberInput, landData.surveyNumber);
    await this.helpers.typeText(this.landAreaValueInput, landData.landAreaValue.toString());
    
    // Select land area unit
    const unitSelect = await this.driver.findElement(this.landAreaUnitSelect);
    await unitSelect.click();
    await this.driver.sleep(300);
    const unitOption = await unitSelect.findElement(By.xpath(`.//option[@value="${landData.landAreaUnit}"]`));
    await unitOption.click();
    
    // Select land type
    const typeSelect = await this.driver.findElement(this.landTypeSelect);
    await typeSelect.click();
    await this.driver.sleep(300);
    const typeOption = await typeSelect.findElement(By.xpath(`.//option[@value="${landData.landType}"]`));
    await typeOption.click();
    
    await this.helpers.typeText(this.latitudeInput, landData.latitude.toString());
    await this.helpers.typeText(this.longitudeInput, landData.longitude.toString());
  }

  async clickNext() {
    const button = await this.driver.findElement(this.nextButton);
    await this.driver.executeScript('arguments[0].scrollIntoView(true);', button);
    await this.driver.sleep(300);
    await this.driver.executeScript('arguments[0].click();', button);
    await this.driver.sleep(1000);
  }

  async clickPrevious() {
    const button = await this.driver.findElement(this.prevButton);
    await this.driver.executeScript('arguments[0].click();', button);
    await this.driver.sleep(1000);
  }

  async submitForm() {
    const button = await this.driver.findElement(this.submitButton);
    await this.driver.executeScript('arguments[0].scrollIntoView(true);', button);
    await this.driver.sleep(300);
    await this.driver.executeScript('arguments[0].click();', button);
    await this.driver.sleep(2000);
  }

  async getProjectCount() {
    try {
      const cards = await this.driver.findElements(this.projectCards);
      return cards.length;
    } catch (error) {
      return 0;
    }
  }

  async findProjectByTitle(title) {
    try {
      const projectLocator = By.xpath(`//h2[contains(text(), "${title}")]`);
      return await this.helpers.elementExists(projectLocator, 5000);
    } catch (error) {
      return false;
    }
  }

  async clickEditForProject(title) {
    try {
      const cards = await this.driver.findElements(this.projectCards);
      for (const card of cards) {
        const cardText = await card.getText();
        if (cardText.includes(title)) {
          const editBtn = await card.findElement(By.xpath('.//button[@title="Edit project"]'));
          await this.driver.executeScript('arguments[0].scrollIntoView(true);', editBtn);
          await this.driver.sleep(300);
          await this.driver.executeScript('arguments[0].click();', editBtn);
          break;
        }
      }
    } catch (error) {
      console.log('Failed to click edit button:', error.message);
    }
    await this.driver.sleep(1000);
  }

  async clickDeleteForProject(title) {
    try {
      const cards = await this.driver.findElements(this.projectCards);
      for (const card of cards) {
        const cardText = await card.getText();
        if (cardText.includes(title)) {
          const deleteBtn = await card.findElement(By.xpath('.//button[@title="Delete project"]'));
          await this.driver.executeScript('arguments[0].scrollIntoView(true);', deleteBtn);
          await this.driver.sleep(300);
          await this.driver.executeScript('arguments[0].click();', deleteBtn);
          break;
        }
      }
    } catch (error) {
      console.log('Failed to click delete button:', error.message);
    }
    await this.driver.sleep(1000);
  }

  async clickViewForProject(title) {
    try {
      const cards = await this.driver.findElements(this.projectCards);
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
    } catch (error) {
      console.log('Failed to click view button:', error.message);
    }
    await this.driver.sleep(1000);
  }

  async updateProjectTitle(newTitle) {
    const element = await this.driver.findElement(By.css('input[name="title"]'));
    await element.clear();
    await this.driver.sleep(200);
    await element.sendKeys(newTitle);
  }

  async updateProjectFundingGoal(newGoal) {
    const element = await this.driver.findElement(By.css('input[name="fundingGoal"]'));
    await element.clear();
    await this.driver.sleep(200);
    await element.sendKeys(newGoal.toString());
  }

  async confirmDelete() {
    try {
      await this.driver.sleep(500);
      const alert = await this.driver.switchTo().alert();
      await alert.accept();
      await this.driver.sleep(2000);
    } catch (error) {
      console.log('No alert found');
    }
  }

  async searchProjects(query) {
    await this.helpers.typeText(this.searchInput, query);
    await this.driver.sleep(1000);
  }

  async isOnProjectListPage() {
    const currentUrl = await this.helpers.getCurrentUrl();
    return currentUrl.includes('/farmer/projects') && 
           !currentUrl.includes('/farmer/projects/add') &&
           !currentUrl.includes('/farmer/projects/edit/') &&
           !currentUrl.match(/\/farmer\/projects\/[a-f0-9]{24}$/);
  }

  async isOnProjectEditPage() {
    const currentUrl = await this.helpers.getCurrentUrl();
    return currentUrl.includes('/farmer/projects/edit/');
  }

  async isOnProjectDetailsPage() {
    const currentUrl = await this.helpers.getCurrentUrl();
    return currentUrl.match(/\/farmer\/projects\/[a-f0-9]{24}$/) !== null;
  }
}

module.exports = FarmerPage;
