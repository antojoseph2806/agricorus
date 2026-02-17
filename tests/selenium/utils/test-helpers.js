const { By, until } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');
const config = require('../config/test-config');

class TestHelpers {
  constructor(driver) {
    this.driver = driver;
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(locator, timeout = config.explicitWait) {
    return await this.driver.wait(
      until.elementLocated(locator),
      timeout,
      `Element not found: ${locator}`
    );
  }

  /**
   * Wait for element to be clickable
   */
  async waitForClickable(locator, timeout = config.explicitWait) {
    const element = await this.waitForElement(locator, timeout);
    await this.driver.wait(
      until.elementIsVisible(element),
      timeout,
      `Element not visible: ${locator}`
    );
    await this.driver.wait(
      until.elementIsEnabled(element),
      timeout,
      `Element not enabled: ${locator}`
    );
    return element;
  }

  /**
   * Click element with retry
   */
  async clickElement(locator, timeout = config.explicitWait) {
    const element = await this.waitForClickable(locator, timeout);
    await this.driver.executeScript('arguments[0].scrollIntoView(true);', element);
    await this.driver.sleep(500);
    await element.click();
  }

  /**
   * Type text into input field
   */
  async typeText(locator, text, timeout = config.explicitWait) {
    const element = await this.waitForClickable(locator, timeout);
    await element.clear();
    await this.driver.sleep(200); // Small delay after clear
    await element.sendKeys(text);
  }

  /**
   * Get text from element
   */
  async getText(locator, timeout = config.explicitWait) {
    const element = await this.waitForElement(locator, timeout);
    return await element.getText();
  }

  /**
   * Check if element exists
   */
  async elementExists(locator, timeout = 3000) {
    try {
      await this.driver.wait(until.elementLocated(locator), timeout);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Wait for URL to contain text
   */
  async waitForUrlContains(text, timeout = config.explicitWait) {
    await this.driver.wait(
      until.urlContains(text),
      timeout,
      `URL does not contain: ${text}`
    );
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(filename) {
    if (!config.screenshotOnFailure) return;

    const screenshotDir = path.resolve(config.screenshotDir);
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const screenshot = await this.driver.takeScreenshot();
    const filepath = path.join(screenshotDir, `${filename}-${Date.now()}.png`);
    fs.writeFileSync(filepath, screenshot, 'base64');
    console.log(`Screenshot saved: ${filepath}`);
  }

  /**
   * Wait for element to disappear
   */
  async waitForElementToDisappear(locator, timeout = config.explicitWait) {
    await this.driver.wait(async () => {
      try {
        const elements = await this.driver.findElements(locator);
        return elements.length === 0;
      } catch (error) {
        return true;
      }
    }, timeout, `Element did not disappear: ${locator}`);
  }

  /**
   * Select dropdown option by visible text
   */
  async selectDropdownByText(locator, text, timeout = config.explicitWait) {
    const element = await this.waitForClickable(locator, timeout);
    await element.click();
    await this.driver.sleep(500);
    
    const optionLocator = By.xpath(`//option[contains(text(), '${text}')]`);
    const option = await this.waitForClickable(optionLocator, timeout);
    await option.click();
  }

  /**
   * Upload file
   */
  async uploadFile(locator, filePath, timeout = config.explicitWait) {
    const element = await this.waitForElement(locator, timeout);
    const absolutePath = path.resolve(filePath);
    await element.sendKeys(absolutePath);
  }

  /**
   * Execute JavaScript
   */
  async executeScript(script, ...args) {
    return await this.driver.executeScript(script, ...args);
  }

  /**
   * Scroll to element
   */
  async scrollToElement(locator, timeout = config.explicitWait) {
    const element = await this.waitForElement(locator, timeout);
    await this.driver.executeScript('arguments[0].scrollIntoView(true);', element);
    await this.driver.sleep(500);
  }

  /**
   * Wait for page load
   */
  async waitForPageLoad(timeout = config.explicitWait) {
    await this.driver.wait(async () => {
      const readyState = await this.driver.executeScript('return document.readyState');
      return readyState === 'complete';
    }, timeout, 'Page did not load');
  }

  /**
   * Get current URL
   */
  async getCurrentUrl() {
    return await this.driver.getCurrentUrl();
  }

  /**
   * Navigate to URL
   */
  async navigateTo(url) {
    await this.driver.get(url);
    await this.waitForPageLoad();
  }

  /**
   * Refresh page
   */
  async refreshPage() {
    await this.driver.navigate().refresh();
    await this.waitForPageLoad();
  }

  /**
   * Wait for alert and accept
   */
  async acceptAlert(timeout = config.timeouts.medium) {
    await this.driver.wait(until.alertIsPresent(), timeout);
    const alert = await this.driver.switchTo().alert();
    await alert.accept();
  }

  /**
   * Wait for alert and dismiss
   */
  async dismissAlert(timeout = config.timeouts.medium) {
    await this.driver.wait(until.alertIsPresent(), timeout);
    const alert = await this.driver.switchTo().alert();
    await alert.dismiss();
  }

  /**
   * Get alert text
   */
  async getAlertText(timeout = config.timeouts.medium) {
    await this.driver.wait(until.alertIsPresent(), timeout);
    const alert = await this.driver.switchTo().alert();
    return await alert.getText();
  }
}

module.exports = TestHelpers;
