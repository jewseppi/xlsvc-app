import { test, expect } from '@playwright/test';

test.describe('File Upload', () => {
  // These tests require authentication
  // For now, we test that the auth page loads correctly when not authenticated
  
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
  
  test('should redirect to auth when not logged in', async ({ page }) => {
    // Wait for the auth form to be visible
    await page.waitForSelector('text=Excel Processor', { timeout: 15000 });
    
    // Should see the auth form since we're not logged in
    await expect(page.getByText('Excel Processor')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/sign in to your account/i)).toBeVisible({ timeout: 15000 });
  });

  test('should show auth form elements', async ({ page }) => {
    // Wait for the form to be ready
    await page.waitForSelector('text=Excel Processor', { timeout: 15000 });
    
    // Check that all auth form elements are visible
    await expect(page.getByLabel(/email address/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByLabel(/password/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible({ timeout: 15000 });
  });
});
