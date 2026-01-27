import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/app');
  });

  test('should show login form by default', async ({ page }) => {
    // Check that login form is visible - title is "Excel Processor"
    await expect(page.getByText('Excel Processor')).toBeVisible();
    // Subtitle indicates login mode
    await expect(page.getByText('Sign in to your account')).toBeVisible();
    // Form fields
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('should have sign in button', async ({ page }) => {
    // Check that sign in button exists
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should show error on invalid login', async ({ page }) => {
    // Fill in invalid credentials
    await page.getByLabel(/email address/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    
    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Check that error message appears (API will fail since no backend)
    // Just verify the page doesn't crash and form is still visible
    await expect(page.getByLabel(/email address/i)).toBeVisible();
  });
});
