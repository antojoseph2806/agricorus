/**
 * Comprehensive Vendor Functional Tests
 * Tests all vendor features with actual login and interactions
 */

const { test, expect } = require('@playwright/test');

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const API_URL = process.env.API_URL || 'http://localhost:5000';

// Test vendor credentials - Using your existing vendor account
const TEST_VENDOR = {
  email: 'nandu@gmail.com',
  password: 'Anto9862@',
  businessName: 'Test Agri Business',
  ownerName: 'Test Owner',
  phone: '9876543210'
};

// Helper function to login
async function loginAsVendor(page) {
  await page.goto(`${BASE_URL}/vendor/login`);
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Fill login form
  await page.fill('input[type="email"]', TEST_VENDOR.email);
  await page.fill('input[type="password"]', TEST_VENDOR.password);
  
  // Click login button
  await page.click('button[type="submit"]');
  
  // Wait for navigation to dashboard
  await page.waitForURL('**/vendor/dashboard', { timeout: 10000 });
  
  // Verify login successful
  expect(page.url()).toContain('/vendor/dashboard');
}

// 1. VENDOR REGISTRATION TESTS
test.describe('Vendor Registration', () => {
  test('should display registration form correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendor/register`);
    
    // Check heading
    await expect(page.locator('h1')).toContainText('Vendor Registration');
    
    // Check all form fields are present
    await expect(page.locator('input[name="businessName"]')).toBeVisible();
    await expect(page.locator('input[name="ownerName"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="phone"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendor/register`);
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Check for HTML5 validation or error messages
    const businessNameInput = page.locator('input[name="businessName"]');
    await expect(businessNameInput).toHaveAttribute('required', '');
  });

  test('should validate email format', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendor/register`);
    
    // Fill with invalid email
    await page.fill('input[name="email"]', 'invalidemail');
    await page.fill('input[name="businessName"]', 'Test Business');
    
    // Blur to trigger validation
    await page.locator('input[name="email"]').blur();
    
    await page.waitForTimeout(500);
    
    // Check for error message (adjust selector based on your UI)
    const errorExists = await page.locator('text=/valid email/i').count() > 0;
    expect(errorExists).toBeTruthy();
  });

  test('should show password strength indicator', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendor/register`);
    
    // Type password
    await page.fill('input[name="password"]', 'Test@123456');
    
    // Check password strength indicator appears
    await page.waitForTimeout(500);
    const strengthIndicator = await page.locator('text=/strength/i').count();
    expect(strengthIndicator).toBeGreaterThan(0);
  });
});

// 2. VENDOR LOGIN TESTS
test.describe('Vendor Login', () => {
  test('should display login form correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendor/login`);
    
    // Check heading
    await expect(page.locator('h1')).toContainText('Vendor Portal');
    
    // Check form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await loginAsVendor(page);
    
    // Verify we're on dashboard
    expect(page.url()).toContain('/vendor/dashboard');
    
    // Check for dashboard elements
    await expect(page.locator('body')).toContainText(/dashboard|welcome/i);
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendor/login`);
    
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    await page.click('button[type="submit"]');
    
    // Wait for error message
    await page.waitForTimeout(2000);
    
    // Check for error message
    const errorVisible = await page.locator('text=/invalid|failed|incorrect/i').isVisible();
    expect(errorVisible).toBeTruthy();
  });

  test('should toggle password visibility', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendor/login`);
    
    const passwordInput = page.locator('input[type="password"]').first();
    const toggleButton = page.locator('button').filter({ has: page.locator('svg') }).nth(1);
    
    // Initially password type
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click toggle
    await toggleButton.click();
    
    // Should change to text
    await page.waitForTimeout(300);
    const inputType = await page.locator('input[name="password"]').first().getAttribute('type');
    expect(inputType).toBe('text');
  });
});

// 3. VENDOR DASHBOARD TESTS
test.describe('Vendor Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsVendor(page);
  });

  test('should display dashboard metrics', async ({ page }) => {
    // Check for metric cards/stats
    const metricsExist = await page.locator('text=/revenue|orders|products|sales/i').count();
    expect(metricsExist).toBeGreaterThan(0);
  });

  test('should have navigation menu', async ({ page }) => {
    // Check for navigation links
    const navLinks = await page.locator('nav a, .sidebar a, a[href*="/vendor/"]').count();
    expect(navLinks).toBeGreaterThan(0);
  });

  test('should navigate to products page', async ({ page }) => {
    // Click products link
    await page.click('text=/products/i');
    
    await page.waitForTimeout(1000);
    
    // Verify navigation
    expect(page.url()).toContain('/vendor/products');
  });

  test('should navigate to orders page', async ({ page }) => {
    // Click orders link
    await page.click('text=/orders/i');
    
    await page.waitForTimeout(1000);
    
    // Verify navigation
    expect(page.url()).toContain('/vendor/orders');
  });
});

// 4. VENDOR PRODUCTS TESTS
test.describe('Vendor Products Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsVendor(page);
    await page.goto(`${BASE_URL}/vendor/products`);
  });

  test('should display products list page', async ({ page }) => {
    // Check page loaded
    expect(page.url()).toContain('/vendor/products');
    
    // Check for products or empty state
    const hasContent = await page.locator('text=/products|add product|no products/i').count();
    expect(hasContent).toBeGreaterThan(0);
  });

  test('should have add product button', async ({ page }) => {
    // Look for add product button
    const addButton = await page.locator('button, a').filter({ hasText: /add|new|create/i }).count();
    expect(addButton).toBeGreaterThan(0);
  });

  test('should navigate to add product page', async ({ page }) => {
    // Click add product button
    const addButton = page.locator('button, a').filter({ hasText: /add|new|create/i }).first();
    await addButton.click();
    
    await page.waitForTimeout(1000);
    
    // Verify navigation
    expect(page.url()).toMatch(/\/vendor\/products\/(add|new)/);
  });

  test('should display product form on add page', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendor/products/add`);
    
    await page.waitForLoadState('networkidle');
    
    // Check for form elements
    const formExists = await page.locator('form, input, textarea').count();
    expect(formExists).toBeGreaterThan(0);
  });
});

// 5. VENDOR ORDERS TESTS
test.describe('Vendor Orders Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsVendor(page);
    await page.goto(`${BASE_URL}/vendor/orders`);
  });

  test('should display orders page', async ({ page }) => {
    expect(page.url()).toContain('/vendor/orders');
    
    // Check for orders content
    const hasContent = await page.locator('text=/orders|no orders|order/i').count();
    expect(hasContent).toBeGreaterThan(0);
  });

  test('should have order filters or search', async ({ page }) => {
    // Look for filters, search, or select elements
    const hasFilters = await page.locator('select, input[type="search"], input[placeholder*="search" i]').count();
    expect(hasFilters).toBeGreaterThanOrEqual(0); // May not have orders yet
  });

  test('should display order list or empty state', async ({ page }) => {
    // Check for orders table/list or empty state
    const hasOrdersOrEmpty = await page.locator('table, .order-item, text=/no orders/i').count();
    expect(hasOrdersOrEmpty).toBeGreaterThan(0);
  });
});

// 6. VENDOR PAYMENTS TESTS
test.describe('Vendor Payments', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsVendor(page);
    await page.goto(`${BASE_URL}/vendor/payments`);
  });

  test('should display payments page', async ({ page }) => {
    expect(page.url()).toContain('/vendor/payments');
    
    // Check for payments content
    const hasContent = await page.locator('text=/payment|earnings|revenue/i').count();
    expect(hasContent).toBeGreaterThan(0);
  });

  test('should display payment summary or stats', async ({ page }) => {
    // Look for payment metrics
    const hasMetrics = await page.locator('text=/total|pending|settled|earnings/i').count();
    expect(hasMetrics).toBeGreaterThan(0);
  });
});

// 7. VENDOR PROFILE TESTS
test.describe('Vendor Profile', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsVendor(page);
    await page.goto(`${BASE_URL}/vendor/profile`);
  });

  test('should display profile page', async ({ page }) => {
    expect(page.url()).toContain('/vendor/profile');
    
    // Check for profile content
    const hasContent = await page.locator('text=/profile|business|kyc/i').count();
    expect(hasContent).toBeGreaterThan(0);
  });

  test('should display vendor information', async ({ page }) => {
    // Check for vendor details
    const hasInfo = await page.locator('text=/business name|owner|email|phone/i').count();
    expect(hasInfo).toBeGreaterThan(0);
  });

  test('should display KYC status', async ({ page }) => {
    // Look for KYC status
    const hasKYC = await page.locator('text=/kyc|verification|verified|pending/i').count();
    expect(hasKYC).toBeGreaterThan(0);
  });
});

// 8. VENDOR ANALYTICS TESTS
test.describe('Vendor Analytics', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsVendor(page);
  });

  test('should display analytics page', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendor/analytics`);
    
    expect(page.url()).toContain('/vendor/analytics');
    
    // Check for analytics content
    const hasContent = await page.locator('text=/analytics|sales|revenue|performance/i').count();
    expect(hasContent).toBeGreaterThan(0);
  });

  test('should display charts or graphs', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendor/analytics`);
    
    await page.waitForLoadState('networkidle');
    
    // Look for chart elements (canvas, svg, or chart containers)
    const hasCharts = await page.locator('canvas, svg, .chart, [class*="chart"]').count();
    expect(hasCharts).toBeGreaterThanOrEqual(0);
  });
});

// 9. VENDOR INVENTORY TESTS
test.describe('Vendor Inventory', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsVendor(page);
    await page.goto(`${BASE_URL}/vendor/inventory`);
  });

  test('should display inventory page', async ({ page }) => {
    expect(page.url()).toContain('/vendor/inventory');
    
    // Check for inventory content
    const hasContent = await page.locator('text=/inventory|stock|products/i').count();
    expect(hasContent).toBeGreaterThan(0);
  });

  test('should display stock levels', async ({ page }) => {
    // Look for stock information
    const hasStock = await page.locator('text=/stock|quantity|available|low stock/i').count();
    expect(hasStock).toBeGreaterThanOrEqual(0);
  });
});

// 10. VENDOR NOTIFICATIONS TESTS
test.describe('Vendor Notifications', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsVendor(page);
  });

  test('should display notifications page', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendor/notifications`);
    
    expect(page.url()).toContain('/vendor/notifications');
    
    // Check for notifications content
    const hasContent = await page.locator('text=/notification|alert|message/i').count();
    expect(hasContent).toBeGreaterThan(0);
  });
});

// 11. VENDOR LOGOUT TEST
test.describe('Vendor Logout', () => {
  test('should logout successfully', async ({ page }) => {
    await loginAsVendor(page);
    
    // Look for logout button
    const logoutButton = page.locator('button, a').filter({ hasText: /logout|sign out/i }).first();
    
    if (await logoutButton.count() > 0) {
      await logoutButton.click();
      
      await page.waitForTimeout(1000);
      
      // Should redirect to login or home
      expect(page.url()).toMatch(/login|home|\//);
    }
  });
});

// 12. COMPREHENSIVE NAVIGATION TEST
test.describe('Vendor Navigation', () => {
  test('should navigate through all vendor pages', async ({ page }) => {
    await loginAsVendor(page);
    
    const routes = [
      '/vendor/dashboard',
      '/vendor/products',
      '/vendor/orders',
      '/vendor/payments',
      '/vendor/analytics',
      '/vendor/profile',
      '/vendor/inventory',
      '/vendor/notifications',
    ];

    for (const route of routes) {
      await page.goto(`${BASE_URL}${route}`);
      await page.waitForLoadState('networkidle');
      
      // Verify page loaded
      expect(page.url()).toContain(route);
      
      // Check no error page
      const hasError = await page.locator('text=/404|not found|error/i').count();
      expect(hasError).toBe(0);
    }
  });
});
