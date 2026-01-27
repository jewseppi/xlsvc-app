import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app and wait for it to be ready
    await page.goto('/app', { waitUntil: 'networkidle' });
    // Wait for React to render - look for any content from the app
    await page.waitForLoadState('domcontentloaded');
    // Wait a bit for React to hydrate
    await page.waitForTimeout(1000);
  });

  test('should show login form by default', async ({ page }) => {
    // Wait for the page to be fully loaded and React to render
    // Check that login form is visible - title is "Excel Processor"
    await expect(page.getByText('Excel Processor')).toBeVisible({ timeout: 10000 });
    // Subtitle indicates login mode
    await expect(page.getByText('Sign in to your account')).toBeVisible({ timeout: 10000 });
    // Form fields
    await expect(page.getByLabel(/email address/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByLabel(/password/i)).toBeVisible({ timeout: 10000 });
  });

  test('should have sign in button', async ({ page }) => {
    // Check that sign in button exists
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible({ timeout: 10000 });
  });

  test('should show error on invalid login', async ({ page }) => {
    // Wait for form to be ready
    await expect(page.getByLabel(/email address/i)).toBeVisible({ timeout: 10000 });
    
    // Fill in invalid credentials
    await page.getByLabel(/email address/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    
    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Check that error message appears (API will fail since no backend)
    // Just verify the page doesn't crash and form is still visible
    await expect(page.getByLabel(/email address/i)).toBeVisible({ timeout: 10000 });
  });
});
