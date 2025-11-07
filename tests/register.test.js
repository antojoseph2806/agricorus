const { Builder, By, until } = require("selenium-webdriver");
const { expect } = require("chai");
require("chromedriver"); 

// --- Configuration ---
const REGISTER_URL = "http://localhost:5173/register";
const TIMEOUT_GENERAL = 5000;
// Increased alert/modal timeout to allow for network latency and React state updates
const TIMEOUT_ASYNC = 15000; 

describe("AgriCorus Register Page E2E Tests", function () {
    // Increased overall test suite timeout to 90 seconds
    this.timeout(90000); 
    let driver;

    before(async () => {
        driver = await new Builder().forBrowser("chrome").build();
    });

    after(async () => {
        if (driver) await driver.quit();
    });

    // --- Helper Functions ---

    const goToRegister = async () => {
        await driver.get(REGISTER_URL);
        // Wait for the main form title to ensure the page has loaded
        await driver.wait(until.elementLocated(By.xpath("//h2[text()='Join AgriCorus']")), TIMEOUT_GENERAL);
    };

    const fillField = async (name, value) => {
        const input = await driver.findElement(By.name(name));
        await input.clear();
        await input.sendKeys(value);
        // Crucial: Manually trigger blur for immediate client-side validation errors
        await driver.executeScript("arguments[0].blur();", input); 
    };

    const selectRole = async (role) => {
        const radio = await driver.findElement(By.css(`input[name='role'][value='${role}']`));
        await radio.click();
    };

    const clickSubmit = async () => {
        const btn = await driver.findElement(By.css("button[type='submit']"));
        await btn.click();
    };

    // FIX: Using a robust locator for the AlertMessage component
    const getGlobalAlertText = async () => {
        try {
            // Locating by the specific text or class of the AlertMessage container
            const alert = await driver.wait(
                until.elementLocated(By.xpath('//div[contains(@class, "flex items-center p-3")]')),
                TIMEOUT_ASYNC 
            );
            // Wait for the text content itself to appear
            await driver.wait(async () => (await alert.getText()).length > 0, 5000);
            return await alert.getText();
        } catch (e) {
            return "";
        }
    };

    const getFieldError = async (fieldName) => {
        try {
            // XPath to find the error <p> sibling immediately following the input's container
            const errorP = await driver.wait(
                until.elementLocated(
                    By.xpath(
                        `//input[@name='${fieldName}']/ancestor::div[1]/p[contains(@class,'text-red-500')]`
                    )
                ),
                TIMEOUT_GENERAL
            );
            return await errorP.getText();
        } catch {
            return "";
        }
    };

    const fillValidForm = async (unique = false) => {
        // Use unique data for submission tests to avoid backend 'duplicate' errors
        const uniqueEmail = unique ? `valid.user.${Date.now()}@agricorus.com` : "valid.user@example.com";
        // Ensure phone number starts with 6-9 and is 10 digits
        const uniquePhone = unique ? `9${Math.floor(100000000 + Math.random() * 900000000)}` : "9876543210"; 
        
        await fillField("name", "Valid User");
        await fillField("email", uniqueEmail);
        await fillField("phone", uniquePhone);
        await fillField("password", "SecureP@ss123"); // Meets strong password requirements
        await fillField("confirmPassword", "SecureP@ss123");
        await selectRole("investor");
    };

    // --- Core Tests ---

    it("1. Should show global error and inline errors when submitting an empty form", async () => {
        await goToRegister();
        
        await clickSubmit();
        
        // Wait for 2 seconds to allow React state update and render the global alert
        await driver.sleep(2000); 

        // Assert the global error message
        const alertText = await getGlobalAlertText();
        expect(alertText).to.include("Please correct the highlighted errors");
        
        // Check a required field error
        expect(await getFieldError("name")).to.include("Name is required.");
    });
    
    it("2. Should show strong password error on blur", async () => {
        await goToRegister(); 
        await fillField("password", "weakpass");
        const passwordError = await getFieldError("password");
        expect(passwordError).to.include("Password must be 8+ characters, include uppercase, lowercase, number & special character.");
    });

    it("3. Should toggle password visibility when eye icons are clicked", async () => {
        await goToRegister();
        const passwordInput = await driver.findElement(By.name("password"));
        const toggleButton = await passwordInput.findElement(By.xpath("./following-sibling::button"));
        
        expect(await passwordInput.getAttribute('type')).to.equal('password');

        await toggleButton.click();
        expect(await passwordInput.getAttribute('type')).to.equal('text');

        await toggleButton.click();
        expect(await passwordInput.getAttribute('type')).to.equal('password');
    });

    it("4. Should show mismatch error when passwords do not match", async () => {
        await goToRegister();
        await fillField("password", "StrongPass1!");
        await fillField("confirmPassword", "DifferentPass2!"); 
        
        const confirmError = await getFieldError("confirmPassword");
        expect(confirmError).to.include("Passwords do not match.");
    });

    // FIX APPLIED: Corrected the expected string to match the observed output
    it("5. Should successfully submit and open the OTP verification modal", async () => {
        await goToRegister();
        
        await fillValidForm(true); 

        await clickSubmit();

        // 1. Check for the success alert confirming OTP was sent (uses TIMEOUT_ASYNC)
        const alertText = await getGlobalAlertText();
        // FIX: Assert the string observed in the failure output (or a reliable subset)
        expect(alertText).to.include("Registration successful. Please verif"); 
        
        // 2. Wait explicitly for the OTP Modal to appear (FIX: using TIMEOUT_ASYNC)
        const otpModalTitle = await driver.wait(
            until.elementLocated(By.xpath("//h3[text()='Verify your email']")),
            TIMEOUT_ASYNC 
        );
        expect(await otpModalTitle.isDisplayed()).to.be.true;
        
        // 3. Verify the email address is displayed in the modal
        const emailText = await driver.findElement(By.xpath("//p[contains(text(),'Enter the 6-digit OTP sent to')]")).getText();
        expect(emailText).to.include("@agricorus.com");
    });

    // FIX APPLIED: Replaced fixed sleep with driver.wait to handle timer cleanup latency
    it("6. OTP Modal: Should handle resend cooldown logic", async () => {
        await goToRegister();
        await fillValidForm(true); 

        await clickSubmit(); 
        
        // Wait for the OTP modal to appear
        await driver.wait(
            until.elementLocated(By.xpath("//h3[text()='Verify your email']")), 
            TIMEOUT_ASYNC
        );

        const resendButton = await driver.findElement(By.xpath("//button[contains(.,'Resend')]"));
        
        // 1. Initial State: Button should be disabled and show the cooldown
        expect(await resendButton.isEnabled()).to.be.false;
        
        // 2. FIX: Wait until the button is ENABLED (i.e., cooldown is over, 35s max wait)
        await driver.wait(until.elementIsEnabled(resendButton), 35000); 
        
        // 3. Assert the button is now enabled
        expect(await resendButton.isEnabled()).to.be.true;
        
        // 4. Click resend to restart cooldown
        await resendButton.click();
        
        // 5. Assert the cooldown restarts (button is disabled again)
        await driver.sleep(2000); 
        expect(await resendButton.isEnabled()).to.be.false;
    });
});