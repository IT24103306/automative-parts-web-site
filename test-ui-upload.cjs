const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('response', async res => {
    if (res.url().includes('/api/')) {
      console.log('API RESPONSE:', res.url(), res.status());
      try {
        console.log(await res.json());
      } catch (e) {}
    }
  });

  await page.goto('http://localhost:5173/admin/login');
  await page.fill('input[type="email"]', 'admin@test.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/admin');
  await page.goto('http://localhost:5173/admin/products');

  await page.waitForSelector('[title="Manage Images"]');
  await page.click('[title="Manage Images"]');

  // Wait for file input to exist
  await page.waitForSelector('input[type="file"]');
  
  // Set file
  await page.setInputFiles('input[type="file"]', path.join(__dirname, 'dummy.jpg'));
  
  console.log('File selected, waiting for upload...');
  await page.waitForTimeout(5000);

  await browser.close();
})();
