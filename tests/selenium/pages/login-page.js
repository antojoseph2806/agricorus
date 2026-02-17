const { By } = require('selenium-webdriver');
const config = require('../config/test-config');

class LoginPage {
  constructor(driver, helpers) {
    this.driver = driver;
    this.helpers = helpers;
    
    // Locators
    this.emailInput = By.css('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    this.passwordInput = By.css('input[type="password"], input[name="password"]');
    this.loginButton = By.xpath('//button[contains(text(), "Login") or contains(text(), "Sign In") or contains(text(), "Log In")]');
    this.roleSelector = By.css('select[name="role"], input[name="role"]');
    this.errorMessage = By.css('.error, .alert-danger, [class*="error"]');
    this.successMessage = By.css('.success, .alert-success, [class*="success"]');
  }

  async navigateToLogin() {
    await this.helpers.navigateTo(`${config.baseUrl}/login`);
  }

  async login(email, password, role = 'landowner') {
    await this.navigateToLogin();
    
    // Check if role selector exists
    const roleExists = await this.helpers.elementExists(this.roleSelector, 2000);
    if (roleExists) {
      await this.helpers.selectDropdownByText(this.roleSelector, role);
    }
    
    await this.helpers.typeText(this.emailInput, email);
    await this.helpers.typeText(this.passwordInput, password);
    await this.helpers.clickElement(this.loginButton);
    
    // Wait for navigation after login
    await this.driver.sleep(2000);
  }

  async loginAsLandowner() {
    await this.login(
      config.landowner.email,
      config.landowner.password,
      config.landowner.role
    );
  }

  async loginAsFarmer() {
    await this.login(
      config.farmer.email,
      config.farmer.password,
      config.farmer.role
    );
  }

  async isLoginSuccessful() {
    try {
      // Check if redirected to dashboard or home
      const currentUrl = await this.helpers.getCurrentUrl();
      return currentUrl.includes('dashboard') || 
             currentUrl.includes('home') || 
             !currentUrl.includes('login');
    } catch (error) {
      return false;
    }
  }

  async getErrorMessage() {
    try {
      return await this.helpers.getText(this.errorMessage, 3000);
    } catch (error) {
      return null;
    }
  }
}

module.exports = LoginPage;
