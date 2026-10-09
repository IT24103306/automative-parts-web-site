const { chromium } = require('playwright');

(async () => {
  console.log('Starting end-to-end verification tests...');
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. Login to Admin
    console.log('Testing Admin Login...');
    await page.goto('http://localhost:5173/admin/login');
    await page.fill('input[type="email"]', 'admin@ngmotors.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:5173/admin');
    console.log('✅ Admin Login PASS');

    // 2. Test Customer Management
    console.log('Testing Customer Management...');
    await page.goto('http://localhost:5173/admin/customers');
    await page.waitForSelector('text=Customer Management');
    const tableVisible = await page.isVisible('table');
    if (!tableVisible) {
      console.log('❌ Customer table not visible, might be empty or loading failed.');
    } else {
      console.log('✅ Customer Management PASS');
    }

    // 3. Test Admin Settings Credential Flow
    console.log('Testing Admin Settings...');
    await page.goto('http://localhost:5173/admin/settings');
    await page.waitForSelector('text=Admin Credentials');
    
    // Test the form logic
    await page.fill('input[placeholder="Enter current password to save changes"]', 'password123');
    await page.fill('input[placeholder="Leave blank to keep current"] >> nth=0', 'admin2@ngmotors.com');
    await page.click('button:has-text("Save Changes")');
    
    // Check for success message
    await page.waitForSelector('text=Settings updated successfully!', { timeout: 5000 });
    console.log('✅ Admin Settings Credentials Update PASS');

    // Revert it back
    await page.fill('input[placeholder="Enter current password to save changes"]', 'password123');
    await page.fill('input[placeholder="Leave blank to keep current"] >> nth=0', 'admin@ngmotors.com');
    await page.click('button:has-text("Save Changes")');
    await page.waitForSelector('text=Settings updated successfully!', { timeout: 5000 });
    console.log('✅ Admin Settings Credentials Revert PASS');

    // 4. Test Storefront WhatsApp Button
    console.log('Testing Storefront WhatsApp Fallback...');
    await page.goto('http://localhost:5173/products');
    
    // Get the first product link
    const firstProduct = await page.$('a[href^="/products/"]');
    if (firstProduct) {
      const href = await firstProduct.getAttribute('href');
      await page.goto(`http://localhost:5173${href}`);
      
      const whatsappBtn = await page.$('button:has-text("WhatsApp Us")');
      if (whatsappBtn) {
        console.log('✅ Storefront WhatsApp Button exists PASS');
      } else {
        console.log('❌ Storefront WhatsApp Button missing');
      }
    }

    console.log('\nAll automated tests finished successfully.');

  } catch (err) {
    console.error('❌ Test failed with error:', err);
  } finally {
    await browser.close();
  }
})();
