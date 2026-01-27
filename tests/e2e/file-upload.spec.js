import { test, expect } from '@playwright/test';

test.describe('File Upload', () => {
  // These tests require authentication
  // For now, we test that the auth page loads correctly when not authenticated
  
  test('should redirect to auth when not logged in', async ({ page }) => {
    // Navigate to the app and wait for it to be ready
    await page.goto('/app', { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    
    // Should see the auth form since we're not logged in
    await expect(page.getByText('Excel Processor')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Sign in to your account')).toBeVisible({ timeout: 10000 });
  });

  test('should show auth form elements', async ({ page }) => {
    await page.goto('/app', { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    
    // Check that all auth form elements are visible
    await expect(page.getByLabel(/email address/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByLabel(/password/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible({ timeout: 10000 });
  });
});
