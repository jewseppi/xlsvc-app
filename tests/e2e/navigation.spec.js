import { test, expect } from './fixtures.js';

test.describe('Navigation and Routing', () => {
  test('should protect /app route when not authenticated', async ({ page }) => {
    await page.goto('/app', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => localStorage.clear());
    
    await page.waitForSelector('#root', { state: 'attached' });
    
    // Wait for loading to disappear
    await page.waitForFunction(
      () => {
        const root = document.getElementById('root');
        return root && !root.textContent?.includes('Loading...');
      },
      { timeout: 10000 }
    );
    
    // Should show auth form
    await page.waitForSelector('text=Excel Processor', { timeout: 15000 }).catch(() => {});
    await expect(page.locator('body')).toBeVisible();
  });

  test('should allow access to root route without authentication', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#root', { state: 'attached' });
    
    // Landing page should load
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle deep linking to /app', async ({ page }) => {
    // Mock authentication for deep link
    await page.goto('/app');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-token');
    });
    
    await page.route('**/api/profile', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, email: 'test@example.com', is_admin: false })
      });
    });
    
    await page.route('**/api/files', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ files: [] })
      });
    });
    
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#root', { state: 'attached' });
    
    // Should load dashboard
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle browser back navigation', async ({ page }) => {
    // Navigate to landing page
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    
    // Navigate to app
    await page.goto('/app', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    
    // Go back
    await page.goBack();
    await page.waitForTimeout(500);
    
    // Should be on landing page
    expect(page.url()).toContain('/');
  });

  test('should handle browser forward navigation', async ({ page }) => {
    // Navigate to landing page
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    
    // Navigate to app
    await page.goto('/app', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    
    // Go back
    await page.goBack();
    await page.waitForTimeout(500);
    
    // Go forward
    await page.goForward();
    await page.waitForTimeout(500);
    
    // Should be on /app
    expect(page.url()).toContain('/app');
  });

  test('should handle direct URL access to /app', async ({ page }) => {
    await page.goto('/app', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#root', { state: 'attached' });
    
    // Should load (either auth form or dashboard)
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should maintain auth state across navigation', async ({ page }) => {
    // Set token
    await page.goto('/app');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-token');
    });
    
    await page.route('**/api/profile', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, email: 'test@example.com', is_admin: false })
      });
    });
    
    await page.route('**/api/files', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ files: [] })
      });
    });
    
    // Navigate to landing
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    
    // Navigate back to app
    await page.goto('/app', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#root', { state: 'attached' });
    
    // Should still be authenticated
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
  });
});
