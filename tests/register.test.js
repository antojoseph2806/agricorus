// tests/register.test.js
// Run with:
// npx mocha tests/register.test.js --timeout 120000 --reporter mochawesome --reporter-options "reportDir=reports,reportFilename=agricorus-register,overwrite=true,quiet=true"

const { Builder, By, until } = require("selenium-webdriver");
const edge = require("selenium-webdriver/edge");
const { expect } = require("chai");
const fs = require("fs");
const path = require("path");
const addContext = require("mochawesome/addContext");

// -------------------- Config --------------------
const BASE_URL = process.env.BASE_URL || "http://localhost:5173";
const REGISTER_PATH = "/register"; // adjust if your route differs
const REGISTER_URL = `${BASE_URL}${REGISTER_PATH}`;

const TIMEOUT_GENERAL = 10000;  // wait for DOM elements
const TIMEOUT_ASYNC = 20000;    // network/state/UI transitions
const OTP_RESEND_MAX_MS = 40000; // generous cooldown wait

// If your app redirects to any dashboard after success:
const DASHBOARD_MATCH = /dashboard/i;

// -------------------- Suite --------------------
describe("AgriCorus Register Page E2E Tests (Edge)", function () {
  this.timeout(120000);

  /** @type {import('selenium-webdriver').WebDriver} */
  let driver;

  before(async function () {
    const options = new edge.Options();
    options.addArguments("--no-sandbox");
    options.addArguments("--disable-dev-shm-usage");
    // options.addArguments("--headless=new"); // ← enable in CI if needed

    driver = await new Builder()
      .forBrowser("MicrosoftEdge")
      .setEdgeOptions(options)
      .build();
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  // Attach screenshot on failures to Mochawesome report
  afterEach(async function () {
    if (this.currentTest.state === "failed" && driver) {
      try {
        const png = await driver.takeScreenshot();
        const dir = path.join(__dirname, "..", "reports", "screens");
        fs.mkdirSync(dir, { recursive: true });
        const fileSafe = this.currentTest.fullTitle().replace(/[^\w]+/g, "_");
        const filePath = path.join(dir, `${fileSafe}.png`);
        fs.writeFileSync(filePath, png, "base64");
        addContext(this, `../screens/${path.basename(filePath)}`);
      } catch (_) {
        // ignore screenshot failures
      }
    }
  });

  // -------------------- Helpers --------------------
  async function goToRegister() {
    await driver.get(REGISTER_URL);
    // Prefer a stable data-testid; fallback to heading text:
    await waitForAnyLocated([
      By.css("[data-testid='register-title']"),
      By.xpath("//h2[normalize-space()='Join AgriCorus']"),
      By.xpath("//h1[contains(.,'Register') or contains(.,'Sign Up') or contains(.,'Create Account')]"),
    ], TIMEOUT_GENERAL);
  }

  async function fillField(name, value) {
    const el = await driver.findElement(By.name(name));
    await el.clear();
    await el.sendKeys(value);
    // trigger blur for client-side validation
    await driver.executeScript("arguments[0].blur();", el);
  }

  async function selectRole(roleValue) {
    // Try radio first:
    const radios = await driver.findElements(By.css(`input[name='role'][value='${roleValue}']`));
    if (radios.length) {
      await radios[0].click();
      return;
    }
    // Try <select>:
    const selects = await driver.findElements(By.id("role"));
    if (selects.length) {
      const tag = (await selects[0].getTagName()).toLowerCase();
      if (tag === "select") {
        await selects[0].findElement(By.css(`option[value='${roleValue}']`)).click();
        return;
      }
    }
    // Fallback: click visible label text
    const maybe = await driver.findElements(By.xpath(`//*[self::label or self::div or self::span][contains(., '${roleValue.charAt(0).toUpperCase() + roleValue.slice(1)}')]`));
    if (maybe.length) await maybe[0].click();
  }

  async function clickSubmit() {
    const btn = await waitForAnyLocated([
      By.css("button[type='submit']"),
      By.css("[data-testid='register-submit']"),
      By.xpath("//button[contains(.,'Register') or contains(.,'Sign Up') or contains(.,'Create')]"),
    ], TIMEOUT_GENERAL);
    await btn.click();
  }

  async function waitForAnyLocated(locators, timeoutMs) {
    const end = Date.now() + timeoutMs;
    let lastErr;
    while (Date.now() < end) {
      for (const loc of locators) {
        try {
          const el = await driver.wait(until.elementLocated(loc), 1000);
          return el;
        } catch (e) {
          lastErr = e;
        }
      }
    }
    throw lastErr || new Error("Element not found within timeout");
  }

  async function getGlobalAlertText() {
    try {
      const alert = await waitForAnyLocated([
        By.css("[data-testid='alert']"),
        By.css(".alert, .error, .text-red-500"),
        By.xpath("//div[contains(@class,'flex') and contains(@class,'p-3') and contains(@class,'border') and contains(@class,'rounded')]"),
      ], TIMEOUT_ASYNC);
      await driver.wait(async () => (await alert.getText()).trim().length > 0, 5000);
      return (await alert.getText()).trim();
    } catch {
      return "";
    }
  }

  async function getFieldError(fieldName) {
    try {
      // Prefer data-testid error for field
      const testId = await driver.findElements(By.css(`[data-testid='error-${fieldName}']`));
      if (testId.length) return (await testId[0].getText()).trim();

      // Fallback: error <p> sibling with red text
      const errP = await driver.wait(
        until.elementLocated(
          By.xpath(`//input[@name='${fieldName}']/ancestor::div[1]//p[contains(@class,'text-red')]`)
        ),
        TIMEOUT_GENERAL
      );
      return (await errP.getText()).trim();
    } catch {
      return "";
    }
  }

  function uniqueEmail(prefix = "user") {
    const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "");
    return `${prefix}.${stamp}@agricorus.com`;
  }

  async function fillValidForm(unique = false) {
    const email = unique ? uniqueEmail("valid") : "valid.user@example.com";
    const phone = unique ? `9${Math.floor(100000000 + Math.random() * 900000000)}` : "9876543210";
    await fillField("name", "Valid User");
    await fillField("email", email);
    // if your field is phoneNumber or mobile, adjust here:
    await fillField("phone", phone);
    await fillField("password", "SecureP@ss123");
    await fillField("confirmPassword", "SecureP@ss123");
    await selectRole("investor");
  }

  // -------------------- Tests --------------------

  it("1. Shows global error + inline errors on empty submit", async function () {
    await goToRegister();
    await clickSubmit();

    const alertText = await getGlobalAlertText();
    // match broadly to avoid brittle copy
    expect(alertText.toLowerCase()).to.satisfy(t =>
      t.includes("error") || t.includes("please correct") || t.includes("required")
    );

    const nameErr = await getFieldError("name");
    expect(nameErr.toLowerCase()).to.include("required");
  });

  it("2. Shows strong password error on blur", async function () {
    await goToRegister();
    await fillField("password", "weakpass");
    const pwdErr = await getFieldError("password");
    expect(pwdErr.toLowerCase()).to.satisfy(t =>
      t.includes("8") || t.includes("uppercase") || t.includes("lowercase") || t.includes("number") || t.includes("special")
    );
  });

  it("3. Toggles password visibility via eye icon", async function () {
    await goToRegister();

    const pwd = await driver.findElement(By.name("password"));
    // try known data-testid first
    let toggle;
    const toggles = await driver.findElements(By.css("[data-testid='toggle-password']"));
    if (toggles.length) {
      toggle = toggles[0];
    } else {
      // fallback: following sibling button
      toggle = await driver.findElement(By.xpath("//input[@name='password']/following-sibling::button[1]"));
    }

    expect(await pwd.getAttribute("type")).to.equal("password");
    await toggle.click();
    expect(await pwd.getAttribute("type")).to.equal("text");
    await toggle.click();
    expect(await pwd.getAttribute("type")).to.equal("password");
  });

  it("4. Shows mismatch error when passwords differ", async function () {
    await goToRegister();
    await fillField("password", "StrongPass1!");
    await fillField("confirmPassword", "DifferentPass2!");
    const err = await getFieldError("confirmPassword");
    expect(err.toLowerCase()).to.satisfy(t => t.includes("match"));
  });

  it("5. Submits successfully and opens OTP verification modal", async function () {
    await goToRegister();
    await fillValidForm(true);
    await clickSubmit();

    // 1) success alert mentioning verification/otp
    const alert = await getGlobalAlertText();
    expect(alert.toLowerCase()).to.satisfy(t =>
      t.includes("registration") || t.includes("verify") || t.includes("otp")
    );

    // 2) OTP modal title (prefer data-testid; fallback to text)
    const otpTitle = await waitForAnyLocated([
      By.css("[data-testid='otp-modal-title']"),
      By.xpath("//h3[normalize-space()='Verify your email']"),
      By.xpath("//h3[contains(.,'Verify')]"),
    ], TIMEOUT_ASYNC);
    expect(await otpTitle.isDisplayed()).to.equal(true);

    // 3) Email displayed in modal copy
    const emailLine = await waitForAnyLocated([
      By.xpath("//p[contains(.,'OTP') and contains(.,'sent')]"),
      By.css("[data-testid='otp-instructions']"),
    ], TIMEOUT_ASYNC);
    const text = (await emailLine.getText()).toLowerCase();
    expect(text).to.satisfy(t => t.includes("@agricorus.com") || t.includes("email"));
  });

  it("6. OTP modal resend cooldown works (disables then re-enables)", async function () {
    await goToRegister();
    await fillValidForm(true);
    await clickSubmit();

    // Ensure OTP modal is visible
    await waitForAnyLocated([
      By.css("[data-testid='otp-modal-title']"),
      By.xpath("//h3[contains(.,'Verify')]"),
    ], TIMEOUT_ASYNC);

    // Resend button
    const resendBtn = await waitForAnyLocated([
      By.css("[data-testid='otp-resend']"),
      By.xpath("//button[contains(.,'Resend')]"),
    ], TIMEOUT_GENERAL);

    // Initially disabled
    expect(await resendBtn.isEnabled()).to.equal(false);

    // Wait until enabled (cooldown complete)
    await driver.wait(until.elementIsEnabled(resendBtn), OTP_RESEND_MAX_MS);
    expect(await resendBtn.isEnabled()).to.equal(true);

    // Click to restart cooldown, then confirm disabled again
    await resendBtn.click();
    await driver.sleep(1500);
    expect(await resendBtn.isEnabled()).to.equal(false);
  });
});
