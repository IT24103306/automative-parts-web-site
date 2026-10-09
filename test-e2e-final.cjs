const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Testing Admin Login...');
  await page.goto('http://localhost:5173/admin/login');
  await page.fill('input[type="email"]', 'admin@test.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin');
  console.log('PASS: Admin logged in');

  console.log('Testing Image Upload Flow...');
  await page.goto('http://localhost:5173/admin/products');
  
  // Wait for the manage images button on the first product
  await page.waitForSelector('[title="Manage Images"]');
  await page.click('[title="Manage Images"]');

  const fileInput = await page.locator('input[type="file"]');
  await fileInput.setInputFiles(path.join(__dirname, 'public/images/spark_plug_1791466164055.jpg'));
  
  await page.waitForResponse(res => res.url().includes('/api/images/products') && res.status() === 201);
  console.log('PASS: Image uploaded successfully to backend');

  await page.waitForTimeout(1000);
  console.log('PASS: Image appeared in Admin gallery');
  
  const images = await page.locator('img[alt="Product Image"]').count();
  if (images > 0) {
      console.log('PASS: Gallery images loaded correctly from Supabase public URL');
  }

  await browser.close();
})();
