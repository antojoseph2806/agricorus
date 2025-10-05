const { Builder, By, until } = require("selenium-webdriver");
const { expect } = require("chai");
require("chromedriver");

describe("AgriCorus Register Page Tests", function () {
  this.timeout(60000);
  let driver;

  before(async () => {
    driver = await new Builder().forBrowser("chrome").build();
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  const goToRegister = async () => {
    await driver.get("http://localhost:5173/register");
  };

  const fillField = async (name, value) => {
    const input = await driver.findElement(By.name(name));
    await input.clear();
    await input.sendKeys(value);
    // Trigger validation blur event, which is crucial for inline errors
    await driver.executeScript("arguments[0].blur();", input); 
  };

  const clickSubmit = async () => {
    const btn = await driver.findElement(By.css("button[type='submit']"));
    await btn.click();
  };

  // 💡 FIX APPLIED HERE: Increased timeouts for greater test stability
  const getGlobalAlertText = async () => {
    try {
      // Use a more specific locator or increase timeout for the global alert
      const alert = await driver.wait(
        until.elementLocated(By.css(".flex.items-center.p-3")),
        10000 // ⭐ INCREASED timeout to 10 seconds for locating the element
      );
      await driver.wait(async () => {
        const text = await alert.getText();
        return text && text.length > 0;
      }, 5000); // ⭐ INCREASED wait for text content to appear
      return await alert.getText();
    } catch (e) {
      // console.log("Global alert not found:", e.message);
      return "";
    }
  };

  const getFieldError = async (fieldName) => {
    try {
      // XPath to find the error <p> sibling immediately following the input's container
      const errorP = await driver.wait(
        until.elementLocated(
          By.xpath(
            `//input[@name='${fieldName}']/ancestor::div[1]/following-sibling::p[contains(@class,'text-red-500')]`
          )
        ),
        5000
      );
      await driver.wait(async () => {
        const text = await errorP.getText();
        return text && text.length > 0;
      }, 3000);
      return await errorP.getText();
    } catch {
      return "";
    }
  };

  // ✅ FIXED TEST: Removed unnecessary blur loop and relies on the submit action to trigger validation.
  it("should show global error when submitting empty form", async () => {
    await goToRegister();
    
    // Submitting the empty form triggers client-side validation (handleSubmit logic in register.tsx)
    await clickSubmit();

    // Assert the global error message from the AlertMessage component
    const alertText = await getGlobalAlertText();
    expect(alertText).to.include("Please correct the highlighted errors");
  });
// ----------------------------------------------------------------------
  it("should show inline error for invalid email", async () => {
    await goToRegister();
    await fillField("name", "Test User");
    await fillField("email", "invalid-email"); // Invalid field
    await fillField("phone", "9876543210");
    await fillField("password", "StrongPass1!");
    await fillField("confirmPassword", "StrongPass1!");
    await driver.findElement(By.css("input[name='role'][value='farmer']")).click();
    
    await clickSubmit(); // Submit to ensure all validations run

    const emailError = await getFieldError("email");
    expect(emailError).to.include("Enter a valid email");
  });

  it("should show inline error for invalid phone", async () => {
    await goToRegister(); 
    await fillField("name", "Test User");
    await fillField("email", "testuser@example.com"); 
    await fillField("phone", "12345"); // Invalid field
    await fillField("password", "StrongPass1!");
    await fillField("confirmPassword", "StrongPass1!");
    await driver.findElement(By.css("input[name='role'][value='farmer']")).click();
    
    await clickSubmit();

    const phoneError = await getFieldError("phone");
    expect(phoneError).to.include("Enter a valid 10-digit Indian phone number");
  });

  it("should show inline error for weak password", async () => {
    await goToRegister(); // Start fresh
    
    // Fill all required fields with VALID data
    await fillField("name", "Test User");
    await fillField("email", "testuser@example.com");
    await fillField("phone", "9876543210");
    await driver.findElement(By.css("input[name='role'][value='farmer']")).click();

    // Set the INVALID password and confirm password
    await fillField("password", "weak");
    await fillField("confirmPassword", "weak");
    
    await clickSubmit();

    const passwordError = await getFieldError("password");
    expect(passwordError).to.include("Password must be 8+ characters");
  });
// ----------------------------------------------------------------------

  it("should show inline error when passwords do not match", async () => {
    await goToRegister();
    await fillField("name", "Test User");
    await fillField("email", "testuser@example.com");
    await fillField("phone", "9876543210");
    await driver.findElement(By.css("input[name='role'][value='farmer']")).click();

    await fillField("password", "StrongPass1!");
    await fillField("confirmPassword", "DifferentPass1!"); // Invalid field
    
    await clickSubmit();

    const confirmError = await getFieldError("confirmPassword");
    expect(confirmError).to.include("Passwords do not match");
  });

  it("should show inline error when role is not selected", async () => {
    await goToRegister();
    await fillField("name", "Test User");
    await fillField("email", "testuser@example.com");
    await fillField("phone", "9876543210");
    await fillField("password", "StrongPass1!");
    await fillField("confirmPassword", "StrongPass1!");
    // Do NOT select role

    // Manually trigger the blur/validation for role (if needed, though clickSubmit should cover it)
    // Note: Your component uses the final validation in handleSubmit for the role,
    // so simply clicking submit is sufficient.
    
    await clickSubmit();

    // Use a specific locator for the role error message
    const roleErrorP = await driver.wait(
      until.elementLocated(By.xpath("//p[contains(text(),'Please select a role')]")),
      5000
    );
    await driver.wait(async () => {
      const text = await roleErrorP.getText();
      return text && text.length > 0;
    }, 3000);

    const roleError = await roleErrorP.getText();
    expect(roleError).to.include("Please select a role");
  });

  it("should register successfully with valid data", async () => {
    await goToRegister();
    await fillField("name", "Test User");

    // Unique email & phone to avoid duplicates
    const uniqueEmail = `testuser${Date.now()}@example.com`;
    const uniquePhone = `9${Math.floor(100000000 + Math.random() * 900000000)}`;

    await fillField("email", uniqueEmail);
    await fillField("phone", uniquePhone);
    await fillField("password", "StrongPass1!");
    await fillField("confirmPassword", "StrongPass1!");
    await driver.findElement(By.css("input[name='role'][value='investor']")).click();

    await clickSubmit();

    // The alert should contain 'Registration successful'
    const alertText = await getGlobalAlertText();
    expect(alertText).to.include("Registration successful");

    // Ensure redirection to /login
    await driver.wait(until.urlContains("/login"), 5000);
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).to.include("/login");
  });
});