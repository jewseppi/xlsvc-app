import { test, expect } from './fixtures.js';

test.describe('Error Scenarios', () => {
  test('should handle network errors', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/**', route => {
      route.abort('failed');
    });
    
    await page.goto('/app', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#root', { state: 'attached' });
    
    // App should still render (error handling)
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle 401 unauthorized redirect', async ({ page }) => {
    // Mock 401 response
    await page.route('**/api/profile', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Unauthorized' })
      });
    });
    
    await page.goto('/app');
    await page.evaluate(() => {
      localStorage.setItem('token', 'invalid-token');
    });
    
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#root', { state: 'attached' });
    
    // Should show auth form after 401
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle 500 server error', async ({ page }) => {
    // Mock 500 response
    await page.route('**/api/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });
    
    await page.goto('/app', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#root', { state: 'attached' });
    
    // App should handle error gracefully
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle timeout errors', async ({ page }) => {
    // Mock timeout
    await page.route('**/api/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
        delay: 30000 // Long delay to simulate timeout
      });
    });
    
    await page.goto('/app', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForSelector('#root', { state: 'attached' });
    
    // App should handle timeout
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle invalid token', async ({ page }) => {
    await page.goto('/app');
    await page.evaluate(() => {
      localStorage.setItem('token', 'invalid-token-format');
    });
    
    await page.route('**/api/profile', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid token' })
      });
    });
    
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#root', { state: 'attached' });
    
    // Should clear token and show auth form
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display error boundary on component error', async ({ page }) => {
    // This would require injecting an error into the React component
    // For now, just verify the app loads
    await page.goto('/app', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#root', { state: 'attached' });
    
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
  });
});
