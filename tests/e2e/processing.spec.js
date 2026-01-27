import { test, expect } from '@playwright/test';

test.describe('File Processing', () => {
  // These tests require authentication
  // For now, we verify the landing page works
  
  test('should load landing page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Wait for React root to be populated
    await page.waitForSelector('#root', { state: 'attached' });
    
    // Landing page should load
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate to app', async ({ page }) => {
    // Clear localStorage to ensure no auth state
    await page.goto('/app');
    await page.evaluate(() => localStorage.clear());
    
    // Navigate to the app and wait for React to hydrate
    await page.goto('/app', { waitUntil: 'domcontentloaded' });
    
    // Wait for React root to be populated
    await page.waitForSelector('#root', { state: 'attached' });
    
    // Wait for loading state to disappear
    await page.waitForFunction(
      () => {
        const root = document.getElementById('root');
        return root && !root.textContent?.includes('Loading...');
      },
      { timeout: 10000 }
    );
    
    // Wait for the auth form to be visible
    await page.waitForSelector('text=Excel Processor', { timeout: 15000 });
    
    // Auth form should be visible
    await expect(page.getByText('Excel Processor')).toBeVisible({ timeout: 15000 });
  });
});
