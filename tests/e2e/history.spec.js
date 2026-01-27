import { test, expect } from '@playwright/test';

test.describe('Processing History', () => {
  // These tests require authentication
  // For now, we verify the app loads correctly
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/app');
  });

  test('should show auth page when not logged in', async ({ page }) => {
    // Without authentication, user should see auth form
    await expect(page.getByText('Excel Processor')).toBeVisible();
  });

  test('should have working form inputs', async ({ page }) => {
    // Verify form is interactive
    const emailInput = page.getByLabel(/email address/i);
    await emailInput.fill('test@example.com');
    await expect(emailInput).toHaveValue('test@example.com');
  });
});
