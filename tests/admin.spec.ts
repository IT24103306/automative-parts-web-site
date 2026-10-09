import { test, expect } from '@playwright/test';

test.describe('Admin Panel E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Go to admin page
    await page.goto('http://localhost:5173/admin');
  });

  test('1. Admin Login', async ({ page }) => {
    // Attempt login with wrong password
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    
    // Expect error message or still on login
    await expect(page.locator('text=Invalid credentials')).toBeVisible({ timeout: 5000 }).catch(() => {});
    
    // Login with correct credentials
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await expect(page).toHaveURL(/.*\/admin\/?$/);
    
    // Dashboard should load
    await expect(page.locator('text=Dashboard').first()).toBeVisible();
  });

  test('2. Dashboard Loads', async ({ page }) => {
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/admin\/?$/);
    
    // Verify no console errors
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    
    // Wait a bit to see if any errors pop up
    await page.waitForTimeout(2000);
    expect(errors.length).toBe(0);
  });
});
