import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { width: 320, height: 640 },
  { width: 360, height: 740 },
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
];

const ROUTES = [
  '/',
  '/products',
  '/categories',
  '/cart',
  '/checkout',
  '/contact',
  '/admin/login'
];

test.describe('Mobile Responsiveness Audit', () => {
  for (const vp of VIEWPORTS) {
    test.describe(`Viewport ${vp.width}x${vp.height}`, () => {
      test.use({ viewport: vp });

      for (const route of ROUTES) {
        test(`Check horizontal overflow on ${route}`, async ({ page }) => {
          // Go to production URL since local might not have all data seeded
          const baseUrl = process.env.BASE_URL || 'https://automative-parts-web-site.vercel.app';
          const fullUrl = `${baseUrl}${route}`;
          
          await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
          
          // Wait for the main wrapper or body to be visible
          await page.waitForSelector('main', { state: 'visible', timeout: 15000 });
          
          // Wait for any animations to settle
          await page.waitForTimeout(1000);
          
          // Check for horizontal overflow
          const hasOverflow = await page.evaluate(() => {
            return document.documentElement.scrollWidth > window.innerWidth;
          });
          
          // If there is overflow, we screenshot the problematic area
          if (hasOverflow) {
            await page.screenshot({ path: `playwright-report/overflow-${vp.width}-${route.replace(/\//g, '-') || 'home'}.png`, fullPage: true });
          }
          
          expect(hasOverflow, `Page ${route} has horizontal overflow at width ${vp.width}px`).toBe(false);
        });
      }
    });
  }
});
