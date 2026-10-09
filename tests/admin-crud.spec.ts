import { test, expect } from '@playwright/test';

test.describe('Admin CRUD Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:5173/admin/login');
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/admin/);
  });

  test('1. Category CRUD', async ({ page }) => {
    await page.locator('nav').locator('text=Categories').click();
    await expect(page).toHaveURL(/.*\/admin\/categories/);
    
    // Create
    await page.locator('button', { hasText: 'Add Category' }).click();
    await page.waitForTimeout(500); // Give modal time to animate
    
    await page.locator('input[placeholder="e.g. Engine Parts"]').fill('Test Category Playwright v2');
    await page.locator('textarea[placeholder="Category description..."]').fill('Test Description');
    await page.locator('button', { hasText: /Create|Save/i }).filter({ hasNotText: 'Add' }).first().click();
    
    // Verify
    await expect(page.locator('text=Test Category Playwright v2').first()).toBeVisible({ timeout: 5000 });
    
    // Confirm delete if modal appears
    page.once('dialog', dialog => dialog.accept());
    
    // Delete
    const rowEdited = page.locator('tr:has-text("Test Category Playwright v2")').first();
    await rowEdited.locator('button').locator('.lucide-trash').click();
    
    // Verify deletion
    await expect(page.locator('text=Test Category Playwright v2')).toHaveCount(0, { timeout: 5000 });
  });

  test('2. Product CRUD', async ({ page }) => {
    await page.locator('nav').locator('text=Products').click();
    await expect(page).toHaveURL(/.*\/admin\/products/);
    
    // Create Product
    await page.locator('button', { hasText: 'Add Product' }).click();
    await page.waitForTimeout(500); // Give modal time to animate
    
    const productNameInput = page.locator('label:has-text("Product Name *") ~ input');
    await productNameInput.fill('Test Product Playwright v2');
    
    const uniqueId = Date.now().toString();
    const partNumberInput = page.locator('label:has-text("Part Number *") ~ input');
    await partNumberInput.fill(`PN-${uniqueId}`);
    
    const skuInput = page.locator('label:has-text("SKU *") ~ input');
    await skuInput.fill(`SKU-${uniqueId}`);
    
    const brandInput = page.locator('label:has-text("Brand *") ~ input');
    await brandInput.fill('Brand');
    
    const stockInput = page.locator('label:has-text("Stock Quantity") ~ input');
    if (await stockInput.isVisible()) {
      await stockInput.fill('10');
    }
    
    // Select the first category available
    const categorySelect = page.locator('label:has-text("Category *") ~ select');
    if (await categorySelect.isVisible()) {
      await categorySelect.selectOption({ index: 1 });
    }
    
    await page.locator('button', { hasText: /Create|Save/i }).filter({ hasNotText: 'Add' }).first().click();
    
    // Verify creation
    await expect(page.locator('text=Test Product Playwright v2').first()).toBeVisible({ timeout: 5000 });
    
    // Confirm delete
    page.once('dialog', dialog => dialog.accept());
    
    // Delete
    const row = page.locator('tr:has-text("Test Product Playwright v2")').first();
    await row.locator('button').locator('.lucide-trash').click();
    
    await expect(page.locator('text=Test Product Playwright v2')).toHaveCount(0, { timeout: 5000 });
  });
});
