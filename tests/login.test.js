// tests/login.test.js
const { Builder, By, until } = require("selenium-webdriver");
const edge = require("selenium-webdriver/edge");
const { expect } = require("chai");

describe("AgriCorus Login Page Test (Edge)", function () {
  this.timeout(90000);

  let driver;

  before(async function () {
    console.log("🚀 Launching Microsoft Edge...");
    const options = new edge.Options();
    options.addArguments("--no-sandbox");
    options.addArguments("--disable-dev-shm-usage");
    // options.addArguments("--headless=new");

    driver = await new Builder()
      .forBrowser("MicrosoftEdge")
      .setEdgeOptions(options)
      .build();

    console.log("✅ Edge launched successfully");
  });

  after(async function () {
    console.log("🛑 Closing Edge");
    await driver.quit();
  });

  // --- Valid Login ---
  it("should login successfully with correct credentials", async function () {
    await driver.get("http://localhost:5173/login");
    await driver.wait(until.elementLocated(By.id("email")), 10000);

    await driver.findElement(By.id("email")).sendKeys("nandu@gmail.com");
    await driver.findElement(By.id("password")).sendKeys("Anto9862@");
    await driver.findElement(By.css('button[type="submit"]')).click();

    await driver.wait(async () => {
      const url = await driver.getCurrentUrl();
      return (
        url.includes("/dashboard") ||
        url.includes("/farmerdashboard") ||
        url.includes("/landownerdashboard") ||
        url.includes("/investordashboard") ||
        url.includes("/admindashboard")
      );
    }, 20000);

    const currentUrl = await driver.getCurrentUrl();
    console.log("✅ Redirected to:", currentUrl);
    expect(currentUrl).to.match(/dashboard/i);
  });

  // --- Invalid Credentials ---
  it("should show error with invalid credentials", async function () {
    await driver.get("http://localhost:5173/login");
    await driver.wait(until.elementLocated(By.id("email")), 10000);

    const email = await driver.findElement(By.id("email"));
    const password = await driver.findElement(By.id("password"));
    const loginBtn = await driver.findElement(By.css('button[type="submit"]'));

    await email.clear();
    await password.clear();
    await email.sendKeys("wronguser@gmail.com");
    await password.sendKeys("wrongpassword");

    await driver.executeScript("arguments[0].click();", loginBtn);

    const alert = await driver.wait(
      until.elementLocated(
        By.css("div.flex.items-center.p-3.mb-4.border.rounded-lg")
      ),
      10000,
      "Alert message did not appear"
    );
    const alertText = await alert.getText();
    console.log("❌ Alert text:", alertText);
    expect(alertText.length).to.be.greaterThan(0);
  });

  // --- Empty Fields (Browser Validation) ---
  it("should prevent login with empty fields", async function () {
    await driver.get("http://localhost:5173/login");
    await driver.wait(until.elementLocated(By.id("email")), 10000);

    const email = await driver.findElement(By.id("email"));
    const password = await driver.findElement(By.id("password"));
    const loginBtn = await driver.findElement(By.css('button[type="submit"]'));

    // Check browser validation for empty fields
    const emailValid = await driver.executeScript(
      "return arguments[0].checkValidity();",
      email
    );
    const passwordValid = await driver.executeScript(
      "return arguments[0].checkValidity();",
      password
    );

    expect(emailValid).to.be.false;
    expect(passwordValid).to.be.false;

    console.log("⚠️ Browser validation prevented empty form submission");
  });

  // --- Remember Me ---
  it('should keep user logged in if "Remember Me" is checked', async function () {
    await driver.get("http://localhost:5173/login");

    await driver.findElement(By.id("email")).sendKeys("nandu@gmail.com");
    await driver.findElement(By.id("password")).sendKeys("Anto9862@");
    await driver.findElement(By.id("remember-me")).click();
    await driver.findElement(By.css('button[type="submit"]')).click();

    await driver.wait(until.urlContains("dashboard"), 15000);

    await driver.navigate().refresh();
    const currentUrl = await driver.getCurrentUrl();
    console.log("✅ Current URL after refresh:", currentUrl);
    expect(currentUrl).to.match(/dashboard/i);
  });

  // --- Logout ---
  it("should logout successfully", async function () {
    await driver.get("http://localhost:5173/landownerdashboard");

    let logoutBtn;
    try {
      logoutBtn = await driver.wait(
        until.elementLocated(By.id("logout-btn")),
        10000
      );
    } catch (err) {
      logoutBtn = await driver.wait(
        until.elementLocated(By.xpath(`//button[contains(., 'Logout')]`)),
        10000
      );
    }

    await logoutBtn.click();

    await driver.wait(until.urlContains("/login"), 15000);
    const currentUrl = await driver.getCurrentUrl();
    console.log("✅ Redirected to login:", currentUrl);
    expect(currentUrl).to.include("/login");
  });
});
