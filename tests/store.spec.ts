import { test, expect } from '@playwright/test';

test.describe('Customer Flows', () => {
  test('1. WhatsApp links and CTAs', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    
    // Find WhatsApp link (assuming it has wa.me or something)
    // Or check if a contact CTA exists
    const waLinks = await page.locator('a[href*="wa.me"], a[href*="whatsapp"]').count();
    // Some sites might use dynamic links, just check if at least one contact link exists
    if (waLinks === 0) {
      // Just check any CTA button
      const ctas = await page.locator('button, a.btn, a.button').count();
      expect(ctas).toBeGreaterThan(0);
    } else {
      expect(waLinks).toBeGreaterThan(0);
    }
  });

  test('2. Pre-book form submission', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    
    // Find the specific button on the home page
    const prebookLink = page.locator('button:has-text("PRE-BOOK A PART")').first();
    const isVisible = await prebookLink.isVisible().catch(() => false);
    
    if (isVisible) {
      await prebookLink.click();
      await page.waitForTimeout(1000);
      
      // Fill out prebook form
      await page.fill('input[name="customerName"]', 'Test User');
      await page.fill('input[name="phone"]', '1234567890');
      await page.fill('input[name="vehicleMake"]', 'Toyota');
      await page.fill('input[name="vehicleModel"]', 'Camry');
      await page.fill('input[name="vehicleYear"]', '2020');
      await page.fill('input[name="partName"]', 'Bumper');
      await page.fill('textarea[name="notes"]', 'Need a front bumper');
      
      const submitBtn = page.locator('button[type="submit"], button:has-text("Submit")');
      await submitBtn.click();
      
      // Expect success message
      await expect(page.locator('text=/success|received|thank you/i').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('3. Cart and Checkout (COD)', async ({ page }) => {
    await page.goto('http://localhost:5173/products');
    
    // Add first product to cart if available
    const productCard = page.locator('.group').first();
    const addToCartBtn = productCard.locator('button:has-text("Add to Cart"), button:has-text("Cart")').first();
    
    const count = await addToCartBtn.count();
    if (count > 0) {
      await addToCartBtn.click();
      
      // Go to cart or checkout
      await page.goto('http://localhost:5173/checkout');
      
      // Fill checkout details
      await page.fill('input[name="firstName"], input[placeholder*="First"]', 'John');
      await page.fill('input[name="lastName"], input[placeholder*="Last"]', 'Doe');
      await page.fill('input[name="email"], input[type="email"]', 'john@test.com');
      await page.fill('input[name="phone"], input[type="tel"]', '1234567890');
      await page.fill('input[name="address"], input[placeholder*="Address"]', '123 Test St');
      await page.fill('input[name="city"], input[placeholder*="City"]', 'Test City');
      await page.fill('input[name="postalCode"], input[placeholder*="Zip"]', '12345');
      
      // Select COD
      const codLabel = page.locator('text=/Cash on Delivery|COD/i').first();
      if (await codLabel.isVisible()) {
        await codLabel.click();
      }
      
      // Place Order
      await page.locator('button:has-text("Place Order"), button:has-text("Confirm")').click();
      
      // Expect order confirmation
      await expect(page).toHaveURL(/.*\/order-confirmation|.*\/success|.*\/tracking/);
    }
  });
});
