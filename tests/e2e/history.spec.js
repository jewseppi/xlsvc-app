import { test, expect } from './fixtures.js';

test.describe('Processing History', () => {
  // These tests require authentication
  // For now, we verify the app loads correctly
  
  test.beforeEach(async ({ page }) => {
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
  });

  test('should show auth page when not logged in', async ({ page }) => {
    // Wait for the auth form to be visible
    await page.waitForSelector('text=Excel Processor', { timeout: 15000 });
    
    // Without authentication, user should see auth form
    await expect(page.getByText('Excel Processor')).toBeVisible({ timeout: 15000 });
  });

  test('should have working form inputs', async ({ page }) => {
    // Wait for form to be ready
    await page.waitForSelector('text=Excel Processor', { timeout: 15000 });
    await expect(page.getByLabel(/email address/i)).toBeVisible({ timeout: 15000 });
    
    // Verify form is interactive
    const emailInput = page.getByLabel(/email address/i);
    await emailInput.fill('test@example.com');
    await expect(emailInput).toHaveValue('test@example.com');
  });
});
