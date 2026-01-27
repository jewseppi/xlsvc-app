import { test, expect } from '@playwright/test';

test.describe('File Processing', () => {
  // These tests require authentication
  // For now, we verify the landing page works
  
  test('should load landing page', async ({ page }) => {
    await page.goto('/');
    // Landing page should load
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate to app', async ({ page }) => {
    await page.goto('/app');
    // Auth form should be visible
    await expect(page.getByText('Excel Processor')).toBeVisible();
  });
});
